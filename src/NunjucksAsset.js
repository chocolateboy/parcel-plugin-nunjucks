import cosmiconfig   from 'cosmiconfig'
import Nunjucks      from 'nunjucks'
import { parseFile } from 'nunjucks-parser'
import Asset         from 'parcel-bundler/src/Asset'
import Path          from 'path'

/**
 * A cache which associates a base Asset class (e.g. JSONAsset, HTMLAsset)
 * with its corresponding synthetic subclass.
 */
const CACHE = new Map()

/**
 * An array of arguments to pass to Asset#getConfig indicating where to find
 * config data for this plugin.
 */
const CONFIG_FILE = [
    ['.nunjucksrc', '.nunjucks.js', 'nunjucks.config.js'],
    {
        packageKey: 'nunjucks'
    }
]

/**
 * A reference to the NunjucksAsset class (defined below), which serves two
 * purposes:
 *
 * a) it's an instantiable class ([NunjucksAsset < Asset < Object]) which
 * processes the nunjucks template and then halts any further processing. This
 * is used for templated raw assets e.g. HTML templates we don't want to process
 * with PostHTML.
 *
 * b) it's also used to construct instances of the dynamic subclasses which
 * inherit from a more specific asset-type determined by the template's filename
 * or +assetType+ option e.g. [NunjucksAsset < HTMLAsset < Asset < Object]
 *
 * In the first case, we return from the constructor in the usual way (i.e.
 * implicitly return `this`). In the second case, we return the actual instance
 * of the (dynamic) subclass.
 *
 * In both cases, the implementation of the +load+ method is the same, so we
 * define it in the static class. Since we use the same class name for the
 * dynamic NunjucksAsset subclasses and the static NunjucksAsset class, we need
 * a way to refer to the latter from the body of the former (where the +load+
 * method is referenced), so this variable holds a shared reference to it
 */
let NunjucksAssetClass

/**
 * Given a superclass (e.g. HTMLAsset, JSONAsset), get the corresponding
 * subclass from the cache, creating it if it doesn't exist.
 */
function extend (baseClass) {
    const cached = CACHE.get(baseClass)

    if (cached) {
        return cached
    }

    class NunjucksAsset extends baseClass {}

    NunjucksAsset.prototype.load = NunjucksAssetClass.prototype.load

    CACHE.set(baseClass, NunjucksAsset)

    return NunjucksAsset
}

/**
 * Takes a possibly-lazy value and yields its result if it's a function (passing
 * through any supplied arguments), or the value itself otherwise.
 */
function force (value, ...args) {
    return (typeof value === 'function') ? value(...args) : value
}

/**
 * Return the absolute path of the effective config file (one of package.json,
 * .nunjucksrc, .nunjucks.js, or nunjucks.config.js) if available.
 *
 * Used to resolve relative paths in config.root.
 */
async function getConfigPath (asset) {
    const [filenames, options] = CONFIG_FILE
    const pkg = await asset.getPackage()

    if (pkg && pkg[options.packageKey]) {
        return pkg.pkgfile
    }

    // setting `load` to false returns the path to the config file rather than
    // its contents
    return asset.getConfig(filenames, { load: false })
}

/**
 * A synchronous version of Asset#getConfig. Needed because we need to access
 * config data (config.assetType) from the NunjucksAsset constructor, which is
 * synchronous.
 */
function getConfigSync (asset) {
    // Parcel doesn't provide a way to load an asset's config file synchronously
    // [1], so we have to do it ourselves, using the same logic i.e. walk up
    // from the asset's dir to the enclosing node_modules directory or the
    // filesystem's root directory, whichever comes first
    //
    // [1] https://github.com/parcel-bundler/parcel/issues/3566

    const [filenames, options] = CONFIG_FILE
    const path = asset.name

    // FIXME this is what we want to use for stopDir to exactly match Parcel's
    // behavior [1], but resolving the stopDir dynamically is not currently
    // supported by cosmiconfig [2], and there's no hook to override its
    // Explorer class, so for now we have to make do with stopping at the
    // project root (i.e. the current working directory)
    //
    // [1] see src/Resolver.js#findPackage and src/utils/config.js#resolve
    // [2] https://github.com/davidtheclark/cosmiconfig/issues/219

    // const fsRoot = Path.parse(path).root
    // const stopDir = dir => {
    //     return (dir === fsRoot) || Path.basename(dir) === 'node_modules'
    // }

    const explorer = cosmiconfig(options.packageKey, {
        searchPlaces: ['package.json'].concat(filenames),
        stopDir: process.cwd(), // project root
    })

    const result = explorer.searchSync(path)
    const config = result && result.config

    return config || {}
}

/**
 * Takes an asset path and returns an object containing components of its path
 * and base path (i.e. the path without the .njk extension). Passed as the
 * argument to lazy options (functions), e.g.:
 *
 *     // if there's no base extension, infer the asset type from the name of
 *     // the containing directory, e.g.:
 *     //
 *     //   - foo.html.njk    → html
 *     //   - bar.js.njk      → js
 *     //   - baz.css.njk     → css
 *     //   - src/js/foo.njk  → js
 *     //   - src/css/bar.njk → css
 *
 *     module.exports = {
 *         assetType ({ baseExt, dirname }) {
 *             return baseExt || dirname
 *         }
 *     }
 */
function parsePath (path) {
    const parsed = Path.parse(path)
    const basePath = Path.join(parsed.dir, parsed.name)
    const baseExt = Path.extname(parsed.name)
    const dirname = Path.basename(parsed.dir)
    const dirs = parsed.dir.split(Path.sep)

    // if path is "/foo/bar/baz.html.njk":
    return {
        baseExt,               // ".html"
        basePath,              // "/foo/bar/baz.html"
        dirname,               // "bar"
        dir: parsed.dir,       // "/foo/bar"
        dirs,                  // ["", "foo", "bar"]
        ext: parsed.ext,       // ".njk"
        filename: parsed.base, // "baz.html.njk"
        name: parsed.name,     // "baz.html"
        path,                  // "/foo/bar/baz.html.njk"
        root: parsed.root,     // "/"
    }
}

/**
 * The NunjucksAsset class instantiates an instance of one of the following
 * classes:
 *
 *     1) NunjucksAsset < Asset < Object
 *     2) NunjucksAsset < XAsset < Asset < Object
 *
 * - where XAsset is a specific asset-type e.g. HTMLAsset or JSONAsset.
 *
 * Note: while the classes differ, the class name is the same in both cases (see
 * the notes on the NunjucksAssetClass variable for more details).
 */
class NunjucksAsset extends Asset {
    constructor (path, options) {
        super(path, options) // initialize so we can use `getConfig`

        const parsedPath = parsePath(path)
        const { basePath, baseExt } = parsedPath
        const config = getConfigSync(this)

        // because this is synchronous, config.assetType can't be async, so we
        // don't await the result. (also, like config.env, there's no particular
        // reason it should be async)
        let assetType = force(config.assetType, parsedPath)

        if (assetType) {
            if (typeof assetType !== 'object') {
                assetType = { raw: false, value: assetType }
            }

            // raw: true: extending RawAsset doesn't work as they're implemented
            // as symlink-like references to the path of the raw (unprocessed)
            // file, and there's no (e.g.) PlainTextAsset we can extend, so we
            // directly extend Asset instead. the inheritance chain for this is
            // already statically defined for this class, so we're done and can
            // just return (void)
            if (assetType.raw === true) {
                // assign this.type, which sets the output file's extension
                const type = assetType.value || baseExt || 'html'
                this.type = type.startsWith('.') ? type.slice(1) : type
                return
            } else {
                assetType = assetType.value
            }
        }

        // XXX Parser#findParser should support an `ext` option rather than
        // forcing us to concoct a fake filename
        let dummmyPath

        if (assetType) {
            dummmyPath = `${basePath}.${assetType}`
        } else if (baseExt && options.parser.extensions[baseExt.toLowerCase()]) {
            dummmyPath = basePath
        } else {
            dummmyPath = `${basePath}.html`
        }

        const superclass = options.parser.findParser(dummmyPath)
        const subclass = extend(superclass)

        return new subclass(path, options)
    }

    /**
     * Load the nunjucks template at the path supplied in `this.name` and
     * return its rendered contents (string). Configuration and data for the
     * nunjucks instance (Environment) is read from a config file, if available.
     * If the template depends on (i.e. loads) any nested templates, they are
     * registered as dependencies with Parcel.
     */
    async load () {
        const _config = await this.getConfig(...CONFIG_FILE)
        const config = _config || {}
        const parsedPath = parsePath(this.name)
        const projectRootDir = process.cwd()

        // calling this after `getConfig` ensures we a) get the cached package.json
        // (if any) and b) avoid any side effects that haven't already been
        // triggered by `getConfig`
        const configPath = _config ? (await getConfigPath(this)) : null
        const configDir = configPath ? Path.dirname(configPath) : null

        const templateDirs = [].concat(config.root || '.').map(dir => {
            // resolve config.root paths relative to the config file (if
            // available) or, failing that, the project root directory (the
            // current working directory)
            return Path.resolve(configDir || projectRootDir, dir)
        })

        const env = force(config.env, parsedPath) || Nunjucks.configure(
            templateDirs,
            config.options || {}
        )

        if (config.filters && !config.env) {
            for (const [name, fn] of Object.entries(config.filters)) {
                env.addFilter(name, fn)
            }
        }

        const data = (await force(config.data, parsedPath)) || {}
        const { content, dependencies } = await parseFile(env, this.name, { data })

        for (const dependency of dependencies) {
            if (dependency.parent) { // exclude self
                this.addDependency(dependency.path, {
                    resolved: dependency.path,
                    includedInParent: true,
                })
            }
        }

        return content
    }
}

NunjucksAssetClass = NunjucksAsset

export default NunjucksAsset

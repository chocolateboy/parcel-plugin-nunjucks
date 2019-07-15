import Nunjucks      from 'nunjucks'
import { parseFile } from 'nunjucks-parser'
import Asset         from 'parcel-bundler/lib/Asset'
import syncPromise   from 'parcel-bundler/lib/utils/syncPromise'
import Path          from 'path'

/*
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
 * Given a superclass (e.g. HTMLAsset, JSONAsset), get the corresponding
 * subclass from the cache, creating it if it doesn't exist.
 */
function extend (baseClass) {
    const cached = CACHE.get(baseClass)

    if (cached) {
        return cached
    }

    class NunjucksAsset extends baseClass {}

    NunjucksAsset.prototype.load = load

    CACHE.set(baseClass, NunjucksAsset)

    return NunjucksAsset
}

/*
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
    // XXX promiseSync (which uses the deasync NPM module) may be removed in
    // Parcel v2 (although currently it's used in more places in the v2 codebase
    // than in Parcel v1), at which point we'll need to write a sync version
    // ourselves or use a library e.g.:
    //
    //   - https://github.com/davidtheclark/cosmiconfig
    //
    // XXX for future reference, note that Parcel walks from the asset's
    // directory up to the project root directory, so a replacement
    // should do the same. (This is what allows custom configs to work in the
    // test subdirectories.)

    try {
        return syncPromise(asset.getConfig(...CONFIG_FILE)) || {}
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

/**
 * Load the nunjucks template at the path supplied in `this.name` and return its
 * rendered contents (string). Configuration and data for the nunjucks instance
 * (Environment) is read from a config file, if available. If the template
 * depends on (i.e. loads) any nested templates, they are registered as
 * dependencies with Parcel.
 *
 * Although defined as a function, `load` is actually a method attached to each
 * Asset subclass we generate. However, it's the same implementation — the same
 * function — for each subclass so it's pulled out here rather than being
 * redefined each time we generate a subclass.
 *
 * Before:
 *
 *     function createSubclass (baseClass) {
 *         return class NunjucksAsset extends baseClass {
 *             // XXX a different `load` method is generated for each subclass
 *             async load () { ... }
 *         }
 *     }
 *
 * After:
 *
 *     async function load () { ... }
 *
 *     function createSubclass (baseClass) {
 *         const subclass = class NunjucksAsset extends baseClass {}
 *         // ✔ use the same load method for each subclass
 *         subclass.prototype.load = load
 *         return subclass
 *     }
 */
async function load () {
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
        // resolve root paths relative to the config-file path (if available)
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

/**
 * Takes an asset path and returns an object containing components of its path
 * and base path (i.e. the path without the .njk extension). Passed as the
 * argument to lazy options (functions) e.g.:
 *
 *   // base the asset type on the name of the containing directory e.g.:
 *   //
 *   //   js/foo.njk     => js
 *   //   css/bar.njk    => css
 *   //   index.html.njk => html
 *   //
 *   module.exports = {
 *       assetType ({ baseExt, dirname }) {
 *           return baseExt || dirname
 *       }
 *   }
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
 * The constructor for nunjucks assets. Returns an instance of a generated class
 * which a) overrides Asset#load and b) extends the Asset class of the
 * template's base type, or HTMLAsset if the base type can't be inferred from
 * the filename.
 *
 * Examples:
 *
 *     foo.json.njk:
 *
 *         // [ NunjucksAsset, JSONAsset, Asset, Object ]
 *         class NunjucksAsset extends JSONAsset {
 *             async load () { ... }
 *         }
 *
 *     bar.html.njk:
 *
 *         // [ NunjucksAsset, HTMLAsset, Asset, Object ]
 *         class NunjucksAsset extends HTMLAsset {
 *             async load () { ... }
 *         }
 *
 *     baz.njk:
 *
 *         // [ NunjucksAsset, HTMLAsset, Asset, Object ]
 *         class NunjucksAsset extends HTMLAsset {
 *             async load () { ... }
 *         }
 */

// XXX note: we extend Asset here so that we can use its facilities in the
// constructor (i.e. Asset#getConfig), but the value returned by this
// constructor is not [ NunjucksAsset, Asset, Object ] and the `this`
// instance used in the constructor is discarded
export default class NunjucksAsset extends Asset {
    constructor (path, options) {
        super(path, options) // initialize so we can use `getConfig`

        const parsedPath = parsePath(path)
        const { basePath, baseExt } = parsedPath
        const config = getConfigSync(this)

        // because this is synchronous, config.assetType can't be async, so we
        // don't await the result. (also, like config.env, there's no particular
        // reason it should be async)
        const assetType = force(config.assetType, parsedPath)

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
}

const Bundler          = require('parcel-bundler')
const Path             = require('path')
const NunjucksPlugin   = require('..')
const BundleNormalizer = require('./bundle-normalizer')

const isDevelopment = process.env.NODE_ENV === 'development'

const BUNDLER_OPTIONS = {
    autoinstall: false,
    cache: false,
    contentHash: false,
    hmr: false,
    logLevel: (isDevelopment ? 4 : 0),
    production: false,
    publicUrl: './',
    sourceMaps: false,
    target: 'node',
    watch: false,
}

function dump (test, value, _options = {}) {
    console.warn(`\n/********************* ${test} *********************/\n`)
    const options = Object.assign({}, { depth: null }, _options)
    console.dir(value, options)
}

async function createBundler (test, testDir, _entries, _options) {
    const entries = [].concat(_entries)
    const entryPaths = entries.map(entry => Path.join(testDir, entry))
    const outDir = Path.join(testDir, 'dist')
    const options = Object.assign({}, BUNDLER_OPTIONS, { outDir }, _options || {})
    const bundler = new Bundler(entryPaths, options)

    if (isDevelopment && _options) {
        dump(test, options)
    }

    await NunjucksPlugin(bundler)

    return bundler
}

function dirname (testDir) {
    return Path.basename(testDir)
}

async function getBundle (testDir, options = {}) {
    const test = dirname(testDir)
    const entries = options.entry || options.entries || 'index.html.njk'
    const bundlerOptions = options.options
    const rootDir = Path.resolve(__dirname, '..')
    const bundler = await createBundler(test, testDir, entries, bundlerOptions)
    const bundle = await bundler.bundle()
    const normalizer = new BundleNormalizer({ rootDir, testDir })
    const normalizedBundle = normalizer.normalize(bundle)

    if (isDevelopment) {
        // const scrubbedBundle = normalizer.scrubBundle(bundle)
        // dump(scrubbedBundle, { sorted: true })
        dump(test, normalizedBundle)
    }

    return normalizedBundle
}

module.exports = { dirname, getBundle }

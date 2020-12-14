const Path       = require('path')
const slash      = require('slash')
const protochain = require('protochain')
const traverse   = require('traverse')

// XXX from the AVA docs:
//
// Please note that we do not add or modify built-ins. For example, if you use
// `Object.fromEntries()` [1] in your tests, they will crash in Node.js 10 which
// does not implement this method.
//
// [1] https://github.com/tc39/proposal-object-from-entries
require('core-js/modules/es.object.from-entries')

// make the newlines in generated output consistent so the snapshots match on
// Windows
const normalizeNewlines = (acc, [key, value]) => {
    if (typeof value === 'string') {
        value = value.replace(/\r\n/g, '\n')
    }

    return acc[key] = value, acc
}

class BundleNormalizer {
    constructor ({ testDir, rootDir }) {
        this.assetId = 0
        this.bundleId = 0
        this.rootDir = rootDir
        this.seen = new Map()
        this.testDir = testDir || rootDir
    }

    _normalizeAsset (asset) {
        if (!asset) return asset

        let id = this.seen.get(asset)

        if (id) {
            return { $type: 'AssetRef', $assetId: id }
        } else {
            id = ++this.assetId
            this.seen.set(asset, id)
        }

        return {
            $type: 'Asset',
            $assetId: id,
            $ancestors: protochain(asset).map(it => it.constructor.name),
            type: asset.type,
            name: this._testRelative(asset.name),
            basename: asset.basename,
            rootDir: this._packageRelative(asset.options.rootDir),
            generated: this._normalizeGenerated(asset.generated),
            dependencies: this._normalizeDependencies(asset.dependencies),
            entryFiles: asset.options.entryFiles.map(it => this._testRelative(it)),
        }
    }

    _normalizeDependencies (dependencies) {
        const entries = Array.from(dependencies.entries()).map(([_key, _value]) => {
            const key = this._packageRelative(_key)
            const value = { name: this._packageRelative(_value.name) }

            // exclude the `loc` object (an instance of Position)
            if ('dynamic' in _value) value.dynamic = _value.dynamic
            if ('includedInParent' in _value) value.includedInParent = _value.includedInParent
            if ('optional' in _value) value.optional = _value.optional
            if ('parent' in _value) value.parent = this._packageRelative(_value.parent)
            if ('resolved' in _value) value.resolved = this._packageRelative(_value.resolved)

            return [key, value]
        })

        return Object.fromEntries(entries)
    }

    _normalizeGenerated (generated) {
        return Object.entries(generated).reduce(normalizeNewlines, {})
    }

    _packageRelative (path) {
        return path && slash(Path.relative(this.rootDir, path))
    }

    _scrubBundle (bundle) {
        return traverse(bundle).forEach(function (value) {
            if (this.key === 'env' || this.key === 'extensions') {
                this.update({})
            }
        })
    }

    _testRelative (path) {
        return path && slash(Path.relative(this.testDir, path))
    }

    normalizeBundle (bundle) {
        if (!bundle) return bundle

        let id = this.seen.get(bundle)

        if (id) {
            return { $type: 'BundleRef', $bundleId: id }
        } else {
            id = ++this.bundleId
            this.seen.set(bundle, id)
        }

        return {
            $type: 'Bundle',
            $bundleId: id,
            type: bundle.type,
            name: this._testRelative(bundle.name),
            entryAsset: this._normalizeAsset(bundle.entryAsset),
            assets: Array.from(bundle.assets).map(it => this._normalizeAsset(it)),
            childBundles: Array.from(bundle.childBundles).map(it => this.normalizeBundle(it)),
            siblingBundles: Array.from(bundle.siblingBundles).map(it => this.normalizeBundle(it)),
        }
    }
}

BundleNormalizer.prototype.normalize = BundleNormalizer.prototype.normalizeBundle

module.exports = BundleNormalizer

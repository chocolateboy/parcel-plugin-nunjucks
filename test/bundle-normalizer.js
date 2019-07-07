const Path       = require('path')
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

class BundleNormalizer {
    constructor ({ testDir, rootDir }) {
        this.assetId = 0
        this.bundleId = 0
        this.rootDir = rootDir
        this.seen = new Map()
        this.testDir = testDir || rootDir
    }

    normalizeAsset (asset) {
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
            name: this.relTest(asset.name),
            basename: asset.basename,
            rootDir: this.relPkg(asset.options.rootDir),
            generated: asset.generated,
            dependencies: this.normalizeDependencies(asset.dependencies),
            entryFiles: asset.options.entryFiles.map(it => this.relTest(it)),
        }
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
            name: this.relTest(bundle.name),
            entryAsset: this.normalizeAsset(bundle.entryAsset),
            assets: Array.from(bundle.assets).map(it => this.normalizeAsset(it)),
            childBundles: Array.from(bundle.childBundles).map(it => this.normalizeBundle(it)),
            siblingBundles: Array.from(bundle.siblingBundles).map(it => this.normalizeBundle(it)),
        }
    }

    normalizeDependencies (dependencies) {
        const entries = Array.from(dependencies.entries()).map(([_key, _value]) => {
            const key = this.relPkg(_key)
            const value = { name: this.relPkg(_value.name) }

            // exclude the `loc` object (an instance of Position)
            if ('dynamic' in _value) value.dynamic = _value.dynamic
            if ('includedInParent' in _value) value.includedInParent = _value.includedInParent
            if ('optional' in _value) value.optional = _value.optional
            if ('parent' in _value) value.parent = this.relPkg(_value.parent)
            if ('resolved' in _value) value.resolved = this.relPkg(_value.resolved)

            return [key, value]
        })

        return Object.fromEntries(entries)
    }

    scrubBundle (bundle) {
        return traverse(bundle).forEach(function (value) {
            if (this.key === 'env' || this.key === 'extensions') {
                this.update({})
            }
        })
    }

    relTest (path) {
        return path && Path.relative(this.testDir, path)
    }

    relPkg (path, options = {}) {
        return path && Path.relative(this.rootDir, path)
    }
}

BundleNormalizer.prototype.normalize = BundleNormalizer.prototype.normalizeBundle

module.exports = BundleNormalizer

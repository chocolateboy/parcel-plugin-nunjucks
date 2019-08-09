'use strict'

module.exports = {
    data: { name: 'world' },
    assetType (path) {
        return path.filename === 'index.njk'
            ? { value: 'html', raw: true }
            : false // default asset-type i.e. determined by filename
    }
}

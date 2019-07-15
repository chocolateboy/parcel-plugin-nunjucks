'use strict'

module.exports = {
    data({ filename }) { return { name: filename } },
    assetType({ baseExt, dirname }) {
        return baseExt || dirname
    }
}

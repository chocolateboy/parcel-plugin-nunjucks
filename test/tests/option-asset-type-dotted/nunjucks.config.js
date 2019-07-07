'use strict'

module.exports = {
    assetType: '.js',
    data ({ filename }) { return { name: filename } },
}

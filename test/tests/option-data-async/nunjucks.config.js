'use strict'

module.exports = {
    data ({ filename }) { return Promise.resolve({ name: filename }) }
}

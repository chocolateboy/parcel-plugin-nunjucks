'use strict'

module.exports = {
    data: { name: 'World' },
    filters: {
        lc: value => `lowercase ${value.toLowerCase()}`,
        uc: value => `uppercase ${value.toUpperCase()}`,
    },
}

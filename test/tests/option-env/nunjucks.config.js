'use strict'

const Nunjucks = require('nunjucks')

// override the default value of the autoescape option
const env = Nunjucks.configure('.', { autoescape: false })

env.addFilter('myFilter', it => `success: <span>${it.toUpperCase()}</span>`)

module.exports = {
    data: { name: 'world' },
    env,
    // confirm these aren't used
    options: { autoescape: true },
    filters: { myFilter: it => `fail: <span>${it.toUpperCase()}</span>` },
    root: './dist',
}

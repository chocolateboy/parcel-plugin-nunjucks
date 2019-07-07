import { dirname, getBundle } from '../..'
import test                   from 'ava'

const name = dirname(__dirname)

test(name, async t => {
    const bundle = await getBundle(__dirname, {
        entry: './src/html/index.html.njk'
    })

    t.snapshot(bundle, name)
})

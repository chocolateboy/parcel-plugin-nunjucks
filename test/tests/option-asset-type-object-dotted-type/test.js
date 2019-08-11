import { dirname, getBundle } from '../..'
import test                   from 'ava'

const name = dirname(__dirname)

test(name, async t => {
    const bundle = await getBundle(__dirname, {
        entry: 'index.njk'
    })

    t.snapshot(bundle, name)
})


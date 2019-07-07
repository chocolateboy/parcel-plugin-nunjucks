import { dirname, getBundle } from '../..'
import test                   from 'ava'

const name = dirname(__dirname)

test(name, async t => {
    const bundle = await getBundle(__dirname, {
        entries: ['index.njk', 'src/html/page-1.0.njk']
    })

    t.snapshot(bundle, name)
})

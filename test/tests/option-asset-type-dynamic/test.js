import { dirname, getBundle } from '../..'
import test                   from 'ava'

const name = dirname(__dirname)

test(name, async t => {
    const bundle = await getBundle(__dirname, {
        entries: ['index.html.njk', 'src/css/index.njk', 'src/js/index.njk']
    })

    t.snapshot(bundle, name)
})

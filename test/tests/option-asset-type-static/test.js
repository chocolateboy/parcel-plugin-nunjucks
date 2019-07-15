import { dirname, getBundle } from '../..'
import test                   from 'ava'

const name = dirname(__dirname)

test(name, async t => {
    const bundle = await getBundle(__dirname, {
        entries: ['foo.njk', 'bar.css.njk', 'baz.html.njk']
    })

    t.snapshot(bundle, name)
})

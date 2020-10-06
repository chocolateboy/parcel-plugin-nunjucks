# parcel-plugin-nunjucks

[![Build Status](https://travis-ci.org/chocolateboy/parcel-plugin-nunjucks.svg)](https://travis-ci.org/chocolateboy/parcel-plugin-nunjucks)
[![NPM Version](https://img.shields.io/npm/v/parcel-plugin-nunjucks.svg)](https://www.npmjs.org/package/parcel-plugin-nunjucks)

<!-- toc -->

- [NAME](#name)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
- [CONFIGURATION](#configuration)
  - [Type](#type)
  - [Path parameter](#path-parameter)
  - [Options](#options)
    - [assetType](#assettype)
      - [Raw assets](#raw-assets)
    - [data](#data)
    - [env](#env)
    - [filters](#filters)
    - [options](#options)
    - [root](#root)
- [DEVELOPMENT](#development)
  - [NPM Scripts](#npm-scripts)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHORS](#authors)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

parcel-plugin-nunjucks - [Parcel](https://parceljs.org/) support for [nunjucks](https://mozilla.github.io/nunjucks/) templates

# INSTALLATION

    $ npm install nunjucks # peer dependency
    $ npm install parcel-plugin-nunjucks

# SYNOPSIS

```
$ cat src/html/index.njk
```

```jinja
{% extends 'layout.njk' %}

{% block body %}
    <h1>Hello, {{ name }}!</h1>
{% endblock %}
```

```
$ cat nunjucks.config.js
```

```javascript
module.exports = {
    root: './src/html',
    data: { name: process.env.USER },
}
```

```
$ parcel build src/html/index.njk
```

# DESCRIPTION

This is a Parcel plugin which uses nunjucks to translate templates with an
`.njk` extension into Parcel assets.

As with other asset types, nunjucks templates can be top-level
[entries](#root), or dependencies referenced from other documents or templates.

# CONFIGURATION

An [environment](https://mozilla.github.io/nunjucks/api.html#environment) for
any (or every) nunjucks template known to Parcel can be configured by creating
a `nunjucks` entry in the project's `package.json` file, or by exporting
(CommonJS) or defining (JSON) a configuration object in one of the following
files:

- `.nunjucksrc` (JSON)
- `.nunjucks.js`
- `nunjucks.config.js`

## Type

The configuration object has the following type:

```typescript
interface AssetType {
    value?: false | string;
    raw?: boolean;
}

interface NunjucksConfiguration {
    assetType?: false | string | AssetType | ((path: Path) => (false | string | AssetType));
    data?:      object | ((path: Path) => (object | PromiseLike<object>));
    env?:       Nunjucks.Environment | ((path: Path) => Nunjucks.Environment);
    filters?:   { [name: string]: Function };
    options?:   Nunjucks.ConfigureOptions;
    root?:      string | string[];
}
```

## Path parameter

Options that are defined as functions ([`assetType`](#assettype),
[`data`](#data), and [`env`](#env)) are passed an object containing the parsed
components of the template's absolute path (including the path itself) as a
parameter, e.g. if the path is `/foo/bar/baz.html.njk`, the parameter would
contain the following fields:

```javascript
{
    baseExt:  '.html',
    basePath: '/foo/bar/baz.html',
    dir:      '/foo/bar',
    dirname:  'bar',
    dirs:     ['', 'foo', 'bar'],
    ext:      '.njk',
    filename: 'baz.html.njk',
    name:     'baz.html',
    path:     '/foo/bar/baz.html.njk',
    root:     '/',
}
```

## Options

The following options can be defined.

### assetType

Override a template's type within Parcel. This allows the rendered template to
be processed as a file of the specified type, e.g. a HTML template will be
scanned for links to scripts, stylesheets etc., and a templated JavaScript file
will be scanned for `require`s and `import`s etc.

Defined as a falsey value (the default), a string, or an object, or can be
defined as a function, in which case it is called with an object containing the
path of the template being processed (see [Path parameter](#path-parameter)),
and its return value is used as the asset type.

By default, each template's type is determined by the extension before the
`.njk` suffix, defaulting to HTML if there isn't one or if the extension isn't
recognized, e.g.:

| filename         | type       |
|------------------|------------|
| `index.html.njk` | HTML       |
| `index.js.njk`   | JavaScript |
| `index.css.njk`  | CSS        |
| `index.njk`      | HTML       |
| `page-1.0.njk`   | HTML       |

This behavior can be overridden by setting the `assetType` option. The default
value is falsey, which enables the filename-matching behavior. Setting it to a
string makes the value the type for all `.njk` files, e.g. setting it to `html`
makes all files HTML regardless of the filename (which was the default in
parcel-plugin-nunjucks v1):

```javascript
module.exports = {
    data: { ... },
    assetType: 'html',
}
```

The supported types are the extensions registered with Parcel, including those
registered by plugins, and they typically correspond to the standard extensions
for the respective filetypes, e.g.:

| extension  | type       |
| ---------- | ---------- |
| css        | CSS        |
| htm/html   | HTML       |
| js         | JavaScript |
| ts         | TypeScript |

The type can be written with or without the leading dot, e.g. `html` and `.html`
are equivalent.

As an example, the following configuration assigns the default type(s) to most
files, but overrides the type for files in `src/js` and `src/css`. This allows
the latter to be output as e.g. `foo.html`, `bar.js`, `baz.css` etc. rather
than `foo.html.html`, `bar.js.js`, `baz.css.css` etc.

```javascript
// if there's no base extension, infer the asset type from the name of the
// containing directory, e.g.:
//
//   - foo.html.njk    → html
//   - bar.js.njk      → js
//   - baz.css.njk     → css
//   - src/js/foo.njk  → js
//   - src/css/bar.njk → css
//
module.exports = {
    assetType ({ baseExt, dirname }) {
        return baseExt || dirname
    }
}
```

#### Raw assets

By default, nunjucks assets are processed as the specified or inferred
asset-type i.e. they're scanned and transformed in the same way as regular
JavaScript/HTML etc. files. In some cases, it may be preferable to specify a
rendered template's target type/extension (e.g. HTML) without processing it as
that type (e.g. with PostHTML). This can be done by supplying the `assetType`
option as an [object](#type) rather than a string, and setting
its `raw` property to true, e.g.:

```javascript
module.exports = {
    data: { ... },
    assetType: { value: 'html', raw: true },
}
```

If not supplied, the `raw` property defaults to false. As with the non-object
shorthand, the `value` property can be falsey (infer the type from the
filename) or a type name (string), e.g. `html` or `.js`.

### data

Data to expose as the "context" in nunjucks
[assets](https://parceljs.org/assets.html). Can be defined as a function, in
which case it is called with an object containing the path of the template
being processed (see [Path parameter](#path-parameter)), and its return value
(which can be a promise if the data is loaded asynchronously) is used as the
data.

```javascript
module.exports = {
    data: { name: process.env.USER }
}

// or

async function getData ({ filename }) {
    const data = await http.getData()
    return { filename, ...data }
}

module.exports = { data: getData }
```

### env

The [Environment](https://mozilla.github.io/nunjucks/api.html#environment)
instance to use. Can be defined as a function, in which case it is called with
an object containing the path of the template being processed (see
[Path parameter](#path-parameter)), and its return value is used as the
environment.

```javascript
const Nunjucks = require('nunjucks')
const env = Nunjucks.configure('./src/html')

env.addFilter('uc', value => value.toUpperCase())

module.exports = { env }
```

### filters

A map (object) of name/function pairs to add as filters to the environment.
Ignored if the `env` option is supplied.

```javascript
module.exports = {
    filters: {
        uc: value => value.toUpperCase(),
        lc: value => value.toLowerCase(),
    }
}
```

### options

Options to pass to the
[`nunjucks#configure`](https://mozilla.github.io/nunjucks/api.html#configure)
method, which is used to construct the Environment instance. Ignored if the
`env` option is supplied.

```javascript
module.exports = {
    options: { autoescape: false }
}
```

### root

The base template directory or directories. Can be a single path (string) or
multiple paths (array of strings). If not supplied, it defaults to the current
directory (`.`). Ignored if the `env` option is supplied.

Relative paths are resolved against the directory of the configuration file in
which the paths are defined (or the `package.json` if defined there), falling
back to the current working directory if a configuration file isn't found.

```javascript
module.exports = { root: './src/html' }
```

Note that nunjucks only resolves files in the specified/default template
directories, and dies with a misleading error about the file not existing if an
attempt is made to access a template outside these directories. This applies to
nested template dependencies, but also to top-level entry files i.e. this won't
work:

```javascript
module.exports = {
    root: './src/html',
}
```

```
$ parcel ./index.html.njk
# error: ./index.html.njk: template not found: ./index.html.njk
```

The solution is to add the parent directories of entry files that are nunjucks
templates to the list of template directories, e.g.:

```javascript
module.exports = {
    root: ['./src/html', '.'],
}
```

```
$ parcel ./index.html.njk
# OK
```

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - compile the code and save it to the `dist` directory
- clean - remove the `dist` directory and other build artifacts
- rebuild - clean the build artifacts and recompile the code
- test - clean and rebuild and run the test suite
- test:run - run the test suite

</details>

# COMPATIBILITY

* [Maintained Node.js versions](https://github.com/nodejs/Release#readme)

# SEE ALSO

* [nunjucks](https://www.npmjs.com/package/nunjucks) - a Jinja2-inspired templating engine with support for template inheritance
* [posthtml-extend](https://www.npmjs.com/package/posthtml-extend) - a PostHTML plugin which supports Jade-like template inheritance
* [posthtml-include](https://www.npmjs.com/package/posthtml-include) - a PostHTML plugin which supports HTML transclusion

# VERSION

2.2.2

# AUTHORS

- [chocolateboy](mailto:chocolate@cpan.org)
- [Matthew McCune](mailto:matthew@matthew.cx) (original version)

# COPYRIGHT AND LICENSE

Copyright © 2017-2020 by Matthew McCune.

This is free software; you can redistribute it and/or modify it under the
terms of the [MIT license](https://opensource.org/licenses/MIT).

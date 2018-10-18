# parcel-plugin-nunjucks

[![NPM Version](https://img.shields.io/npm/v/parcel-plugin-nunjucks.svg)](https://www.npmjs.org/package/parcel-plugin-nunjucks)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [NAME](#name)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
- [CONFIGURATION](#configuration)
  - [Options](#options)
    - [data](#data)
    - [env](#env)
    - [filters](#filters)
    - [options](#options)
    - [root](#root)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
{% extends "layout.njk" %}

{% block body %}
    <h1>Hello, {{ name }}!</h1>
{% endblock %}
```

```
$ cat nunjucks.config.js
```

```javascript
module.exports = {
    root: "./src/html",
    data: { name: process.env.USER },
}
```

```
$ parcel build src/html/index.njk
```

# DESCRIPTION

This is a Parcel plugin which uses nunjucks to translate templates with an `.njk` extension into HTML assets.

As with HTML assets, nunjucks templates can be top-level entries, or dependencies referenced from other documents or templates.

# CONFIGURATION

An [environment](https://mozilla.github.io/nunjucks/api.html#environment) for each (or every) nunjucks template
known to Parcel can be configured by creating a `nunjucks` entry in the project's package.json file,
or by exporting a configuration object from one of the following files:

- nunjucks.config.js
- .nunjucks.js
- .nunjucksrc

The configuration object has the following type:

```typescript
type NunjucksConfiguration = {
    data?:    Object | string => Object;
    env?:     Environment | string => Environment;
    filters?: Object;
    options?: Object;
    root?:    string | Array<string>;
}
```

## Options

The following options can be defined.

### data

Data to expose as the "context" in nunjucks [assets](https://parceljs.org/assets.html). Can be defined as a function,
in which case it is called with the absolute path/URI of the template being processed and its return value is used as the data.

```javascript
module.exports = { data: { name: process.env.USER } }
```

### env

The [Environment](https://mozilla.github.io/nunjucks/api.html#environment) instance to use. Can be defined as a function,
in which case it is called with the absolute path/URI of the template being processed and its return value is used as the environment.

```javascript
const nunjucks = require('nunjucks')
const env = nunjucks.configure('./src/html')

env.addFilter('uc', value => value.toUpperCase())

module.exports = { env }
```

### filters

A map (object) of name/function pairs to add as filters to the environment. Ignored if the `env` option is supplied.

```javascript
module.exports = {
    filters: {
        uc: value => value.toUpperCase(),
        lc: value => value.toLowerCase(),
    }
}
```

### options

Options to pass to the [`nunjucks#configure`](https://mozilla.github.io/nunjucks/api.html#configure) method,
which is used to construct the Environment instance. Ignored if the `env` option is supplied.

```javascript
module.exports = {
    options: { noCache: true }
}
```

### root

The base template directory or directories. If not supplied, it defaults to the project root.
Ignored if the `env` option is supplied.

```javascript
module.exports = { root: "./src/html" }
```

# COMPATIBILITY

* Node.js >= v7.6.0

# SEE ALSO

* [nunjucks](https://www.npmjs.com/package/nunjucks) - a Jinja2-inspired templating engine with support for template inheritance
* [posthtml-extend](https://www.npmjs.com/package/posthtml-extend) - a PostHTML plugin which supports Jade-like template inheritance
* [posthtml-include](https://www.npmjs.com/package/posthtml-include) - a PostHTML plugin which supports HTML transclusion

# VERSION

1.0.0

# AUTHOR

[Matthew McCune](mailto:matthew@matthew.cx)

# COPYRIGHT AND LICENSE

Copyright © 2017-2018 by Matthew McCune.

This is free software; you can redistribute it and/or modify it under the
terms of the [MIT license](https://opensource.org/licenses/MIT).

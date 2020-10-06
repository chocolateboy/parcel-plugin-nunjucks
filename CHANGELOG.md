## 2.2.2 - 2020-10-06

- bump dependencies

## 2.2.1 - 2020-06-10

- bump dependencies

## 2.2.0 - 2019-10-29

- fix hanging on Node >= v12.11.0 ([#28](https://github.com/chocolateboy/parcel-plugin-nunjucks/issues/28))
  - use cosmiconfig to load config files synchronously rather than Parcel's
    `syncPromise`, which [no longer works](https://github.com/parcel-bundler/parcel/issues/3566)
- update dependencies

## 2.1.1 - 2019-08-11

- correctly handle dotted types in config.assetType.value
  - ensure dotted config.assetType.value (e.g. ".html") is processed the same
    internally as undotted config.assetType.value (e.g. "html")

## 2.1.0 - 2019-08-10

- add support for raw (unprocessed) assets (closes [#25](https://github.com/chocolateboy/parcel-plugin-nunjucks/issues/25))
  - allow the `assetType` option to be supplied as an object with a `raw`
    property (default: false). If set to true, the specified type is used as
    the file's extension and processing stops after the nunjucks template
    processing.

## 2.0.0 - 2019-07-16

- **Breaking Changes**
  - by default, nunjucks files are now typed by extension so that e.g.
    `foo.js.njk` is processed by Parcel as a JavaScript file after the template
    has been rendered by nunjucks. the old behavior (everything is HTML) can be
    restored by setting `{ assetType: "html" }` in the config
  - an object with parsed path components (including the path itself) is passed
    to config.data, config.env and config.assetType functions (if supplied)
    rather than just the path
- update minimum node version to the oldest supported version (v8.0)
- config.data can now be provided asynchronously (thanks, zhuweiyou
  ([#20](https://github.com/chocolateboy/parcel-plugin-nunjucks/pull/20)))
- document a gotcha relating to nunjucks entry files
- add tests
- add build step to ensure compatibility for old nodes
- add changelog

## 1.1.0 - 2019-02-16

- add support for an rcfile i.e. one of:
  - `.nunjucksrs`
  - `.nunjucks.js`
  - `nunjucks.config.js`
- fix relative paths i.e. importing/extending `../../macros/util.html.njk`
  now works
- track each template's loaded dependencies rather than monitoring
  files indiscriminately
- add documentation
- extend the transpiled version of HTMLAsset (`lib/assets/HTMLAsset`)
  rather than the source version (`src/assets/HTMLAsset`) to avoid compatibility
  issues
- bump the minimum supported node version to v7.6.0 for async/await

## 1.0.0 - 2017-12-19

- initial release

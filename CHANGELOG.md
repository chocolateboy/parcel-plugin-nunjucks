1.1.1 - TBD

- document a gotcha relating to nunjucks entry files
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
- extend the transpiled version of HTMLAsset (lib/assets/HTMLAsset)
  rather than the source version (src/assets/HTMLAsset) to avoid
  compatibility issues
- bump the minimum supported node version to v7.6.0 for async/await

## 1.0.0 - 2017-12-19

initial release

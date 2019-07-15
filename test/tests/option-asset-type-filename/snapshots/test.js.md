# Snapshot report for `test/tests/option-asset-type-filename/test.js`

The actual snapshot is saved in `test.js.snap`.

Generated by [AVA](https://ava.li).

## option-asset-type-filename

> option-asset-type-filename

    {
      $bundleId: 1,
      $type: 'Bundle',
      assets: [
        {
          $assetId: 1,
          $type: 'AssetRef',
        },
      ],
      childBundles: [
        {
          $bundleId: 2,
          $type: 'Bundle',
          assets: [
            {
              $assetId: 2,
              $type: 'AssetRef',
            },
            {
              $ancestors: [
                'JSAsset',
                'Asset',
                'Object',
              ],
              $assetId: 3,
              $type: 'Asset',
              basename: 'greeting.js',
              dependencies: {
                '.babelrc.js': {
                  includedInParent: true,
                  name: '.babelrc.js',
                },
                'package.json': {
                  includedInParent: true,
                  name: 'package.json',
                },
              },
              entryFiles: [
                'index.html.njk',
              ],
              generated: {
                js: 'module.exports = \'Hello\';',
              },
              name: 'greeting.js',
              rootDir: 'test/tests/option-asset-type-filename',
              type: 'js',
            },
          ],
          childBundles: [],
          entryAsset: {
            $ancestors: [
              'NunjucksAsset',
              'JSAsset',
              'Asset',
              'Object',
            ],
            $assetId: 2,
            $type: 'Asset',
            basename: 'index.js.njk',
            dependencies: {
              '.babelrc.js': {
                includedInParent: true,
                name: '.babelrc.js',
              },
              'greeting.js': {
                name: 'greeting.js',
                optional: undefined,
                parent: 'test/tests/option-asset-type-filename/index.js.njk',
                resolved: 'test/tests/option-asset-type-filename/greeting.js',
              },
              'package.json': {
                includedInParent: true,
                name: 'package.json',
              },
              'test/tests/option-asset-type-filename/nunjucks.config.js': {
                includedInParent: true,
                name: 'test/tests/option-asset-type-filename/nunjucks.config.js',
              },
            },
            entryFiles: [
              'index.html.njk',
            ],
            generated: {
              js: `const greeting = require('./greeting.js');␊
              ␊
              console.log(`${greeting}, world!`);`,
            },
            name: 'index.js.njk',
            rootDir: 'test/tests/option-asset-type-filename',
            type: 'js',
          },
          name: 'dist/index.js.dd6787c9.js',
          siblingBundles: [],
          type: 'js',
        },
      ],
      entryAsset: {
        $ancestors: [
          'NunjucksAsset',
          'HTMLAsset',
          'Asset',
          'Object',
        ],
        $assetId: 1,
        $type: 'Asset',
        basename: 'index.html.njk',
        dependencies: {
          'index.js.njk': {
            dynamic: true,
            name: 'index.js.njk',
            parent: 'test/tests/option-asset-type-filename/index.html.njk',
            resolved: 'test/tests/option-asset-type-filename/index.js.njk',
          },
          'test/tests/option-asset-type-filename/nunjucks.config.js': {
            includedInParent: true,
            name: 'test/tests/option-asset-type-filename/nunjucks.config.js',
          },
        },
        entryFiles: [
          'index.html.njk',
        ],
        generated: {
          html: `<!DOCTYPE html>␊
          <html>␊
              <head>␊
                  <meta charset="UTF-8">␊
                  <title>Asset type determined by filename</title>␊
              </head>␊
              <body>␊
                  Hello, world!␊
                  <script src="index.js.dd6787c9.js"></script>␊
              </body>␊
          </html>␊
          `,
        },
        name: 'index.html.njk',
        rootDir: 'test/tests/option-asset-type-filename',
        type: 'html',
      },
      name: 'dist/index.html.html',
      siblingBundles: [],
      type: 'html',
    }
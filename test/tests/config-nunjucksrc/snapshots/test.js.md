# Snapshot report for `test/tests/config-nunjucksrc/test.js`

The actual snapshot is saved in `test.js.snap`.

Generated by [AVA](https://avajs.dev).

## config-nunjucksrc

> config-nunjucksrc

    {
      $bundleId: 1,
      $type: 'Bundle',
      assets: [
        {
          $assetId: 1,
          $type: 'AssetRef',
        },
      ],
      childBundles: [],
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
          'test/tests/config-nunjucksrc/.nunjucksrc': {
            includedInParent: true,
            name: 'test/tests/config-nunjucksrc/.nunjucksrc',
          },
          'test/tests/config-nunjucksrc/src/html/fragment.html.njk': {
            includedInParent: true,
            name: 'test/tests/config-nunjucksrc/src/html/fragment.html.njk',
            resolved: 'test/tests/config-nunjucksrc/src/html/fragment.html.njk',
          },
        },
        entryFiles: [
          'src/html/index.html.njk',
        ],
        generated: {
          html: `<!DOCTYPE html>␊
          <html>␊
              <head>␊
                  <meta charset="UTF-8">␊
                  <title>.nunjucksrc config file</title>␊
              </head>␊
              <body>␊
                  <span>Hello, world!</span>␊
                  <span>world fragment!</span>␊
          ␊
              </body>␊
          </html>␊
          `,
        },
        name: 'src/html/index.html.njk',
        rootDir: 'test/tests/config-nunjucksrc/src/html',
        type: 'html',
      },
      name: 'dist/index.html.html',
      siblingBundles: [],
      type: 'html',
    }

module.exports = {
    env: {
        development: {
            sourceMaps: 'inline',
            plugins: ['source-map-support'],
        }
    },
    presets: [
        ['@babel/preset-env', {
            corejs: 3,

            // only include polyfills if they're used
            useBuiltIns: 'usage',

            // set this to true to see the applied transforms and bundled polyfills
            debug: (process.env.NODE_ENV === 'development'),

            targets: 'maintained node versions',
        }]
    ],
}

// Register ourselves as the handler for .njk files
export default bundler => {
    bundler.addAssetType('njk', require.resolve('./NunjucksAsset'))
}

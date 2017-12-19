module.exports = (bundler) => {
  // Register ourselves to handle .njk files
  bundler.addAssetType('njk', require.resolve('./src/NunjucksAsset'));
};

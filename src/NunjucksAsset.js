const nunjucks = require('nunjucks');
const path = require('path');
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');

class NunjucksAsset extends HTMLAsset {
  constructor(name, pkg, options) {
    super(name, pkg, options);

    // Set nunjucks to resolve paths relative to current asset's path
    nunjucks.configure(path.dirname(name));
  }

  parse(code) {
    // Parse Nunjucks into an HTML file and pass it on to the HTMLAsset
    return super.parse(nunjucks.renderString(code));
  }
}

module.exports = NunjucksAsset;

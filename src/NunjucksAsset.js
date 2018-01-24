const nunjucks = require('nunjucks');
const path = require('path');
const klawSync = require('klaw-sync');
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');

class NunjucksAsset extends HTMLAsset {
  constructor(name, pkg, options) {
    super(name, pkg, options);

    // Set nunjucks to resolve paths relative to current asset's path
    nunjucks.configure(path.dirname(name));
    this.nunjucksDir = path.dirname(name);
  }

  async getDependencies() {
    await super.getDependencies();
    // Walk nunjucks directory and add any templates to dependencies
    const paths = klawSync(this.nunjucksDir, { nodir: true });
    const filesList = paths.filter(p =>
      path.extname(p.path).toLowerCase() === '.njk');
    filesList.forEach(dep => {
      this.addDependency(dep.path, { includedInParent: true });
    });
  }

  parse(code) {
    // Parse Nunjucks into an HTML file and pass it on to the HTMLAsset
    return super.parse(nunjucks.renderString(code));
  }
}

module.exports = NunjucksAsset;

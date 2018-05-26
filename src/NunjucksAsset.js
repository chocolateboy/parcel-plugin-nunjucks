const nunjucks   = require('nunjucks');
const path       = require('path');
const klawSync   = require('klaw-sync');
const config     = require('cosmiconfig')
const HTMLAsset  = require('parcel-bundler/src/assets/HTMLAsset');
const njkContext = {};

class NunjucksAsset extends HTMLAsset {
  constructor(name, pkg, options) {
    super(name, pkg, options);

    // Set nunjucks to resolve paths relative to current asset's path
    nunjucks.configure(path.dirname(name));
    this.nunjucksDir = path.dirname(name);

    // load nunjucksrc file
    var pwd          = path.resolve('.') || process.cwd();
    const explorer   = config('nunjucks')
    explorer.load(pwd)
    .then(function(result){
       if(result.config && !result.isEmpty){
          Object.assign(njkContext, result.config);
       }
    })  
    .catch((error) => {
      console.log('parce nunjucksrc file error', error)
    });

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
    return super.parse(nunjucks.renderString(code, njkContext));
  }
}

module.exports = NunjucksAsset;

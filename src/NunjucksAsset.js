'use strict';

const nunjucks = require('nunjucks');
const HTMLAsset = require('parcel-bundler/lib/assets/HTMLAsset');
const { parseFile } = require('nunjucks-parser');

const CONFIG_FILE = [
  ['.nunjucksrc', '.nunjucks.js', 'nunjucks.config.js'],
  { packageKey: 'nunjucks' }
];

// if a config setting is lazy (i.e. a function), force its value by calling it
// with the supplied parameters
function force(value, ...args) {
  return (typeof value === 'function') ? value.apply(this, args) : value;
}

class NunjucksAsset extends HTMLAsset {
  async load() {
    const config = (await this.getConfig.apply(this, CONFIG_FILE)) || {};
    const templateDirs = config.root || this.options.rootDir;
    const templatePath = this.name;

    const env = force(config.env, templatePath) || nunjucks.configure(
      templateDirs,
      config.options || {}
    );

    if (config.filters && !config.env) {
      for (const [name, fn] of Object.entries(config.filters)) {
        env.addFilter(name, fn);
      }
    }

    const data = force(config.data, templatePath) || {};
    const { content, dependencies } = await parseFile(env, templatePath, { data });

    for (const dependency of dependencies) {
      if (dependency.parent) { // exclude self
        this.addDependency(dependency.path, {
          resolved: dependency.path,
          includedInParent: true,
        });
      }
    }

    return content;
  }
}

module.exports = NunjucksAsset;

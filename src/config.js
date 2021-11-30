const defaultConfig = {
  // package.json ignored and don't get project information
  'no-package': false,
  // Extensions which by default are parsed
  parseExtension: ['.mjs', '.js', '.jsx', '.es5', '.es6', '.vue', '.ts', '.tsx']
};

function normalize(config, global) {
  if (config.parseExtension) {
    config.parseExtension = Array.from(
      new Set([...config.parseExtension, ...global.parseExtension])
    );
  }

  return config;
}

export default {
  globalConfig: {
    ...defaultConfig
  },
  reset() {
    this.globalConfig = { ...defaultConfig };
    this.globalConfig.parseExtension = [...defaultConfig.parseExtension];
  },
  add(parameters) {
    Object.assign(this.globalConfig, normalize(parameters, this.globalConfig));
  }
};

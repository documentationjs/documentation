module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 8
        }
      }
    ]
  ],
  ignore: ['**/default_theme/assets/*']
};

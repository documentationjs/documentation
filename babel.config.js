module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 6
        },
        include: ['transform-regenerator']
      }
    ],
    '@babel/preset-flow'
  ],
  plugins: ['@babel/plugin-transform-async-to-generator'],
  ignore: ['**/default_theme/assets/*']
};

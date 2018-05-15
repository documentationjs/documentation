/* @flow */

const fs = require('fs');
const path = require('path');

module.exports = function findReadme(dir: string) {
  const readmeFilenames = [
    'README',
    'README.markdown',
    'README.md',
    'README.txt',
    'Readme.md',
    'readme.markdown',
    'readme.md',
    'readme.txt'
  ];

  const readmeFile = fs.readdirSync(dir).find(function(filename) {
    return readmeFilenames.indexOf(filename) >= 0;
  });

  if (readmeFile) {
    return path.join(fs.realpathSync(dir), readmeFile);
  }
};

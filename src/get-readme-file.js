import fs from 'fs';
import path from 'path';

export default function findReadme(dir) {
  const readmeFilenames = [
    'README.markdown',
    'README.md',
    'Readme.md',
    'readme.markdown',
    'readme.md'
  ];

  const readmeFile = fs.readdirSync(dir).find(function (filename) {
    return readmeFilenames.indexOf(filename) >= 0;
  });

  if (readmeFile) {
    return path.join(fs.realpathSync(dir), readmeFile);
  }

  return 'README.md';
}

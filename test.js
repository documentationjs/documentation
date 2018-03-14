const documentation = require('./lib/index');

const fs = require('fs');

const targets = [
  {
    source: 'Common/types.js',
    output: 'types.md'
  },
  {
    source: 'SDK/src/SdkPrototype.js',
    output: 'sdk.md'
  }
];

for (const target of targets) {
  documentation
    .build([target.source], { ignorePatterns: [/\* @jsx h /] })
    .then(documentation.formats.md)
    .then(output => {
      // output is a string of Markdown data
      fs.writeFileSync(`docs/content/${target.output}`, output);
    });
}

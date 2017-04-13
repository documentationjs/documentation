'use strict';

var getTyped = require('get-typed').default;

import markdown from './output/markdown';

(async function main() {
  try {
    let { resolved, printed } = await getTyped(process.argv[2], []);
    console.log('got resolved');
    console.log(JSON.stringify(resolved, null, 2));
    console.log(markdown(resolved, {}));
  } catch (e) {
    console.error(e);
  }
})();

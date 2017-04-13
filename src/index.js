'use strict';

import getTyped from 'get-typed';

async function main() {
  try {
    let { resolved, printed } = await getTyped(process.argv[2], []);
    console.log('got resolved');
    console.log(JSON.stringify(resolved, null, 2));
  } catch (e) {
    console.error(e);
  }
}

(async function() {
  await main();
  console.log('Yey, story successfully loaded!');
})();

export function addTwo(a, b) {
  return a + b;
}

'use strict';

var JSONStream = require('JSONStream');

/**
 * Create a transform stream that formats documentation as
 * stringified JSON
 *
 * @name json
 * @return {stream.Transform}
 */
module.exports = function () {
  return JSONStream.stringify();
};

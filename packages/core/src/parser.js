// @flow

import type { ParserConfig } from '@documentation/core';

const path = require('path');

module.exports = function createParser ( config: ParserConfig) {

  const handlers: Map<string,FileParser> = new Map(config.handlers || []);


  return ( filePath ) => {
    // Find a matching parser for the file extension
    const { ext } = path.parse(filePath);

    if(handlers.has(ext)) {
      const handler = handlers.get(ext);
      return handler(fs.readFileSync())
    } else {
      return {}
    }

  }
}
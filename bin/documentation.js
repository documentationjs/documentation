#!/usr/bin/env node

'use strict';

var documentation = require('../'),
  args = require('../lib/args'),
  commands = require('../lib/commands');

var parsedArgs = args(process.argv.slice(2));

commands[parsedArgs.command](documentation, parsedArgs);

#!/usr/bin/env node

/* eslint no-console: 0 */

'use strict';

var documentation = require('../'),
  streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  walk = require('../lib/walk'),
  formatError = require('../lib/format_error'),
  args = require('../lib/args.js');

var parsedArgs = args(process.argv.slice(2)),
  formatterOptions = parsedArgs.formatterOptions,
  outputLocation = parsedArgs.output,
  formatter = documentation.formats[parsedArgs.formatter];

documentation(parsedArgs.inputs, parsedArgs.options, function (err, comments) {
  if (err) {
    throw err;
  }

  walk(comments, function (comment) {
    comment.errors.forEach(function (error) {
      console.error(formatError(comment, error));
    });
  });

  formatter(comments, formatterOptions, function (err, output) {
    if (outputLocation !== 'stdout') {
      if (parsedArgs.formatter === 'html') {
        streamArray(output).pipe(vfs.dest(outputLocation));
      } else {
        fs.writeFileSync(outputLocation, output);
      }
    } else {
      process.stdout.write(output);
    }
  });
});

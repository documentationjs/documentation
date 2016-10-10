'use strict';

var fs = require('fs'),
  path = require('path'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  _ = require('lodash'),
  concat = require('concat-stream');

module.exports = function (comments, options, documentation, callback) {

  var linkerStack = documentation.util.createLinkerStack(options)
    .namespaceResolver(comments, function (namespace) {
      return '#' + namespace;
    });

  var sharedImports = {
    imports: {
      formatters: documentation.util
        .createFormatters(linkerStack.link, options)
    }
  };

  sharedImports.imports.renderSectionList =
    _.template(fs.readFileSync(path.join(__dirname, 'section_list._'), 'utf8'), sharedImports);
  sharedImports.imports.renderSection =
    _.template(fs.readFileSync(path.join(__dirname, 'section._'), 'utf8'), sharedImports);
  sharedImports.imports.renderNote =
    _.template(fs.readFileSync(path.join(__dirname, 'note._'), 'utf8'), sharedImports);

  var pageTemplate = _.template(fs.readFileSync(path.join(__dirname, 'index._'), 'utf8'), sharedImports);

  // push assets into the pipeline as well.
  vfs.src([__dirname + '/assets/**'], { base: __dirname })
    .pipe(concat(function (files) {
      callback(null, files.concat(new File({
        path: 'index.html',
        contents: new Buffer(pageTemplate({
          docs: comments,
          options: options
        }), 'utf8')
      })));
    }));
};

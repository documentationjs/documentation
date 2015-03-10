var fs = require('fs'),
  doctrine = require('doctrine'),
  esprima = require('esprima'),
  through = require('through'),
  types = require('ast-types'),
  mdeps = require('module-deps');

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @param {String} index the file to start from
 * @return {Object} stream of output
 */
module.exports = function(index) {
  var md = mdeps();
  md.end({ file: index });
  return md.pipe(through(function(data) {
    var code = fs.readFileSync(data.file);
    var ast = esprima.parse(code, { attachComment: true });
    var docs = [];
    types.visit(ast, {
      visitMemberExpression: function(path) {
        var node = path.value;
        if (node.leadingComments) {
          node.leadingComments.filter(function(c) {
            return c.type === 'Block';
          }).map(function(comment) {
            docs.push(doctrine.parse(comment.value, { unwrap: true }));
          });
        }
        this.traverse(path);
      }
    });
    docs.forEach(this.push);
  }));
};

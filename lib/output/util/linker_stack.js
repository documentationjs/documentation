var globalsDocs = require('globals-docs');
var walk = require('../../walk');

/**
 * Generate a linker method that links given hardcoded namepaths to URLs
 *
 * @param {Object} paths an object specified in documentation.yml of hard paths
 * @returns {Function} linker
 */
function pathsLinker(paths) {
  return function (namespace) {
    if (paths[namespace]) {
      return paths[namespace];
    }
  };
}

/**
 * Given an array of functions, call each of them with `input`
 * and return the output of the first one that returns a truthy value.
 *
 * @param {Array<Function>} fns array of methods
 * @param {*} input any input
 * @returns {*} any output
 */
function firstPass(fns, input) {
  for (var i = 0; i < fns.length; i++) {
    var output = fns[i](input);
    if (output) {
      return output;
    }
  }
}

/**
 * Create a linking method that takes a namepath and returns a URI
 * or a falsy value
 *
 * @param {Object} config - configuration value
 * @returns {Function} linker method
 */
function LinkerStack(config) {
  this.stack = [];

  if (config.defaultGlobals !== false) {
    this.stack.push(function (namespace) {
      return globalsDocs.getDoc(namespace, config.defaultGlobalsEnvs);
    });
  }

  if (config.paths) {
    this.stack.push(pathsLinker(config.paths));
  }

  this.link = this.link.bind(this);
}

LinkerStack.prototype.namespaceResolver = function (comments, resolver) {
  var namespaces = {};
  walk(comments, function (comment) {
    namespaces[comment.namespace] = true;
  });
  this.stack.push(function (namespace) {
    if (namespaces[namespace] === true) {
      return resolver(namespace);
    }
  });
  return this;
};

LinkerStack.prototype.link = function (namepath) {
  return firstPass(this.stack, namepath);
};

module.exports = function (opts) {
  return new LinkerStack(opts);
};

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
  config = config || {};
  this.stack = [];

  if (config.defaultGlobals !== false) {
    this.stack.unshift(function (namespace) {
      if (namespace) {
        return globalsDocs.getDoc(namespace, config.defaultGlobalsEnvs);
      }
    });
  }

  if (config.paths) {
    this.stack.unshift(pathsLinker(config.paths));
  }

  this.link = this.link.bind(this);
}

/**
 * Given that the linker stack is a stack of functions, each of which might
 * be able to resolve the URL target of a given namespace, namespaceResolver
 * adds a function to the stack. You give it a list of comments and it
 * adds a function that, if it matches a namespace to a comment, runs
 * `resolver` on that comment's namespace in order to get a URL. This makes
 * it possible for themes to put each function on a separate page, or at
 * different anchors on the same page, and the resolver does stuff like
 * adding '#' in front of the namespace or turning the namespace into a URL
 * path.
 *
 * @param {Array<Object>} comments a list of comments
 * @param {Function} resolver a method that turns a namespace into a URL
 * @returns {LinkerStack} returns this
 * @private
 * @example
 * var linkerStack = createLinkerStack(options)
 *   .namespaceResolver(comments, function (namespace) {
 *     var slugger = new GithubSlugger();
 *     return '#' + slugger.slug(namespace);
 *   });
 */
LinkerStack.prototype.namespaceResolver = function (comments, resolver) {
  var namespaces = {};
  walk(comments, function (comment) {
    namespaces[comment.namespace] = true;
  });
  this.stack.unshift(function (namespace) {
    if (namespaces[namespace] === true) {
      return resolver(namespace);
    }
  });
  return this;
};

/**
 * Now that you've configured the LinkerStack with `namespaceResolver`
 * and a configuration, run it against a namepath. Might return a URL if
 * it can resolve a target, otherwise returns undefined.
 *
 * @param {string} namepath the namepath of a comment
 * @returns {string?} URL target or maybe undefined
 * @private
 */
LinkerStack.prototype.link = function (namepath) {
  return firstPass(this.stack, namepath);
};

module.exports = function (opts) {
  return new LinkerStack(opts);
};

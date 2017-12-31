
module.exports = {
  access: {
    describe: 'Include only comments with a given access level, out of private, ' + 'protected, public, undefined. By default, public, protected, and undefined access ' + 'levels are included',
    choices: ['public', 'private', 'protected', 'undefined'],
    array: true,
    alias: 'a'
  },

  'infer-private': {
    type: 'string',
    describe: 'Infer private access based on the name. This is a regular expression that ' + 'is used to match the name',
    default: false
  },

  'document-exported': {
    type: 'boolean',
    describe: 'Generate documentation for all exported bindings and members ' + 'even if there is no JSDoc for them',
    default: false
  },

  github: {
    type: 'boolean',
    describe: 'infer links to github in documentation',
    alias: 'g'
  },

  plugin: {
    type: 'string',
    describe: 'register a plugin',
    array: true,
    alias: 'p'
  },

  'no-package': {
    describe: 'dont find and use package.json for project- configuration option defaults',
    alias: 'np',
    type: 'boolean',
    default: false
  }

}
/*
 * Maps command name to a command plugin module.  Each command plugin module
 * should export a function that takes (documentation, parsedArgs), where
 * documentation is just the main module (index.js), and parsedArgs is
 * { inputs, options, command, commandOptions }
 */

module.exports = {
  'build': require('./build'),
  'serve': require('./serve'),
  'lint': require('./lint')
}


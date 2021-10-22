/*
 * Maps command name to a command plugin module.  Each command plugin module
 * must export a function that takes (documentation, parsedArgs), where
 * documentation is just the main module (index.js), and parsedArgs is
 * { inputs, options, command, commandOptions }
 *
 * Command modules should also export a `description`, which will be used in
 * the main CLI help, and optionally a `parseArgs(yargs, parentArgv)` function
 * to parse additional arguments.
 */
import build from './build.js';
import lint from './lint.js';
import readme from './readme.js';

export default { build, lint, readme };

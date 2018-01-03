const sharedConfig = require('../shared-args');
const cleanArgs = require('../clean-args');

const DocumentationEngine = require('@documentation/core').Engine;
const MarkdownFormatter = require('@documentation/format-markdown');
const JSONFormatter = require('@documentation/format-json');
const FilesystemOutput = require('@documentation/output-filesystem');
const TextStreamOutput = require('@documentation/output-textstream');




const yargsCommandConfig = Object.assign({}, sharedConfig, {
  'output-dir': {
    alias: 'o',
    type: 'path',
    describe: 'Output directory. Omit to print to stdout',
  },
  format: {
    alias: 'f',
    type: 'string',
    describe: 'output format. Can be \'json\', \'md\', \'html\' or a package name',
    default: 'json',
  }
})




const buildCommand = function buildCommand(argv) {

  const args = cleanArgs(argv, yargsCommandConfig);
  args.input = argv.input;

  // Prepare the config to pass to the parser
  const parseConfig = {
    access: args.access,
    github: args.github,
    documentExported: args['document-exported'],
    noPackage: args['no-package'],
  }

  // Prepare plugins
  const plugins = getPlugins(args);

  // Prepare the formatter
  const formatter = getFormatter(args);

  // Prepare the output adapter
  const outputAdapter = getOutputAdapter(args);


  const docs = new DocumentationEngine();
  plugins.forEach(plugin => docs.use(plugin));

  return docs.parse(args.input, parseConfig)
    .then( comments => docs.format(comments, formatter))
    .then( files => docs.output(files, outputAdapter))
    .catch( err => {
      throw err;
    })


}





function getFormatter(args) {
  switch(args.format) {
    case 'json':
      return JSONFormatter;
    case 'md':
      return MarkdownFormatter;
    case 'html':
      return HtmlFormatter;
    default:
      try {
        return require(args.format);
      } catch (err) {
        throw new Error("Failed to load formatter "+args.format);
      }
  }
}



function getOutputAdapter(args) {
  if(args['output-dir']) {
    return FilesystemOutput({dir: args['output-dir'] })
  } else {
    return TextStreamOutput(process.stderr);
  }
}


function getPlugins(args) {
  if(args.plugins && args.plugins.length) {
    return args.plugins.map(name => require(name));
  }
  return [];
}





module.exports = {
  command: 'build [input..]',
  describe: 'build docs',
  builder: yargsCommandConfig,
  handler: buildCommand
}
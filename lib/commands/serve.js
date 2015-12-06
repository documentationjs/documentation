'use strict';

var errorPage = require('../../lib/error_page'),
  Server = require('../../lib/server');

var build = require('./build');

module.exports = serve;
module.exports.description = 'generate, update, and display HTML documentation';
module.exports.parseArgs = build.addOutputArgs;

var server = new Server();
server.on('listening', function () {
  process.stdout.write('documentation.js serving on port 4001\n');
});

function serve(documentation, parsedArgs) {
  parsedArgs.commandOptions.format = 'html';
  build(documentation, parsedArgs, function (err, output) {
    if (err) {
      return server.setFiles([errorPage(err)]).start();
    }
    server.setFiles(output).start();
  });
}

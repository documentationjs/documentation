const
  utils = require('@documentation/output-utils');


module.exports = (outputStream) => (files: Array<File>) => {

  // console.log(typeof(outputStream), outputStream);

  console.error("Stream output");

  return utils.streamArray(files)
    .pipe(new utils.stream.ExtractFileContentTransform())
    .pipe(outputStream)
}
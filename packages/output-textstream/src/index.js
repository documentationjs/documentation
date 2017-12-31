const
  utils = require('@documentation/output-utils');


module.exports = (outputStream) => (files: Array<File>) => {
  return utils.streamArray(files)
    .pipe(utils.stream.ExtractFileContentTransform)
    .pipe(outputStream)
}
const
  vfs = require('vinyl-fs');

streamInputs = function (indexes) {
  return vfs.src(indexes);
}



module.exports = {
  stream: streamInputs,
}
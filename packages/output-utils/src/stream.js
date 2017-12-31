
const { Transform } = require('stream')

class ExtractFileContentTransform extends Transform {
  _transform (file: Vinyl, encoding, callback) {
    if(file.contents) {
      this.push(file.contents);
    }
    callback()
  }
}


module.exports = {
  ExtractFileContentTransform,
}

var Readable = require('readable-stream').Readable;


class ArrayStream extends Readable {

  constructor (list: Iterable) {
    super({objectMode: true})
  }

  _read (size) {
    this.push(this._i < this._l ? this._list[this._i++] : null);
  }
}


module.exports = function streamArray(arr) {
  return new ArrayStream(arr);
}

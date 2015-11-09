var http = require('http'),
  concat = require('concat-stream');

function get(url, callback) {
  http.get(url, function (res) {
    res.pipe(concat(function (text) {
      if (res.statusCode >= 400) {
        return callback(res.statusCode);
      }
      callback(text.toString());
    }));
  });
}

module.exports.get = get;

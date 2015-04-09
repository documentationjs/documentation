'use strict';

var through = require('through'),
  os = require('os'),
  fs = require('fs'),
  queue = require('queue-async'),
  path = require('path'),
  Handlebars = require('handlebars'),
  File = require('vinyl'),
  slugg = require('slugg'),
  hat = require('hat'),
  sqlite3 = require('sqlite3');

var infoTemplate = Handlebars
  .compile(fs.readFileSync(path.join(__dirname, '../../share/docset/Info.plist'), 'utf8'));

var kinds = {
  module: 'Module',
  'class': 'Class'
};

function getEntries(comments, entries) {
  entries = entries || [];
  for (var i = 0; i < comments.length; i++) {
    entries.push([comments[i].name, kinds[comments[i].kind] || '',
      'index.html#' + comments[i].path.map(slugg).join('/')]);
    getEntries(comments[i].members.static, entries);
    getEntries(comments[i].members.instance, entries);
  }
  return entries;
}

/**
 * A thin layer on top of the html output mechanism that produces
 * [Dash docsets](https://kapeli.com/dash).
 *
 * @param {Object} opts Options that can customize the output
 * @name docset
 * @return {stream.Transform}
 */
module.exports = function () {
  var tmpFile = os.tmpdir() + hat();
  var db = new sqlite3.Database(tmpFile);
  var entries;

  return through(function (file) {
    var that = this;
    if (file.path === 'index.json') {
      that.push(file);
      entries = getEntries(JSON.parse(file.contents));
    } else {
      var rel = file.relative;
      file.cwd = process.cwd();
      file.base = process.cwd();
      file.path = 'Contents/Resources/Documents/' + rel;
      this.push(file);
    }
  }, function () {
    var that = this;
    that.push(new File({
      path: 'Contents/Info.plist',
      contents: new Buffer(infoTemplate({
        bundleId: 'foo',
        bundleName: 'foo',
        bundlePlatform: 'foo'
      }), 'utf8')
    }));
    db.run('CREATE TABLE IF NOT EXISTS searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT); CREATE UNIQUE INDEX IF NOT EXISTS anchor ON searchIndex (name, type, path);', function () {
      var q = queue(1);
      entries.forEach(function (entry) {
        q.defer(db.run.bind(db), 'INSERT OR IGNORE INTO searchIndex (name, type, path) VALUES (?, ?, ?);', entry);
      });
      q.awaitAll(function () {
        db.close(function () {
          that.push(new File({
            path: 'Contents/Resources/docSet.dsidx',
            contents: fs.readFileSync(tmpFile)
          }));
        });
      });
    });
  });
};

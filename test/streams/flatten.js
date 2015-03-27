'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  flatten = require('../../streams/flatten');

function evaluate(fn, callback) {
  var stream = parse();

  stream
    .pipe(flatten())
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
}

test('flatten - name', function (t) {
  evaluate(function () {
    /** @name test */
    return 0;
  }, function (result) {
    t.equal(result[0].name, 'test');
    t.end();
  });
});

test('flatten - memberof', function (t) {
  evaluate(function () {
    /** @memberof test */
    return 0;
  }, function (result) {
    t.equal(result[0].memberof, 'test');
    t.end();
  });
});

test('flatten - classdesc', function (t) {
  evaluate(function () {
    /** @classdesc test */
    return 0;
  }, function (result) {
    t.equal(result[0].classdesc, 'test');
    t.end();
  });
});

test('flatten - kind', function (t) {
  evaluate(function () {
    /** @kind class */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'class');
    t.end();
  });
});

test('flatten - param', function (t) {
  evaluate(function () {
    /** @param test */
    return 0;
  }, function (result) {
    t.equal(result[0].params.length, 1);
    t.equal(result[0].params[0].name, 'test');
    t.end();
  });
});

test('flatten - returns', function (t) {
  evaluate(function () {
    /** @returns {number} test */
    return 0;
  }, function (result) {
    t.equal(result[0].returns.length, 1);
    t.equal(result[0].returns[0].description, 'test');
    t.end();
  });
});

test('flatten - global', function (t) {
  evaluate(function () {
    /** @global */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'global');
    t.end();
  });
});

test('flatten - static', function (t) {
  evaluate(function () {
    /** @static */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'static');
    t.end();
  });
});

test('flatten - instance', function (t) {
  evaluate(function () {
    /** @instance */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'instance');
    t.end();
  });
});

test('flatten - inner', function (t) {
  evaluate(function () {
    /** @inner */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'inner');
    t.end();
  });
});

test('flatten - access public', function (t) {
  evaluate(function () {
    /** @access public */
    return 0;
  }, function (result) {
    t.notOk('access' in result[0]);
    t.end();
  });
});

test('flatten - access protected', function (t) {
  evaluate(function () {
    /** @access protected */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'protected');
    t.end();
  });
});

test('flatten - access private', function (t) {
  evaluate(function () {
    /** @access private */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'private');
    t.end();
  });
});

test('flatten - public', function (t) {
  evaluate(function () {
    /** @public */
    return 0;
  }, function (result) {
    t.notOk('access' in result[0]);
    t.end();
  });
});

test('flatten - protected', function (t) {
  evaluate(function () {
    /** @protected */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'protected');
    t.end();
  });
});

test('flatten - private', function (t) {
  evaluate(function () {
    /** @private */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'private');
    t.end();
  });
});

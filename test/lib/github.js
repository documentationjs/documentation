'use strict';

/* eslint no-unused-vars: 0 */

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./git/mock_repo'),
  parse = require('../../lib/parsers/javascript'),
  github = require('../../lib/github');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }).map(github);
}

function evaluate(fn) {
  return toComment(fn, '/my/repository/path/index.js');
}

test('github', function (t) {

  mock(mockRepo.master);

  t.equal(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github,
  'https://github.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8',
  'gets github url');

  mock.restore();

  t.end();
});

test('malformed repository', function (t) {

  mock(mockRepo.malformed);

  t.equal(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github, undefined, 'does not crash');

  mock.restore();

  t.end();
});

test('enterprise repository', function (t) {

  mock(mockRepo.enterprise);

  t.equal(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github,
  'https://github.enterprise.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8',
  'gets github enterprise url');

  mock.restore();

  t.end();
});

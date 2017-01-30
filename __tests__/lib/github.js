'use strict';

/* eslint no-unused-vars: 0 */

var mock = require('mock-fs'), mockRepo = require('./git/mock_repo'), parse = require('../../lib/parsers/javascript'), github = require('../../lib/github');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }, {}).map(github);
}

function evaluate(fn) {
  return toComment(fn, '/my/repository/path/index.js');
}

it('github', function () {
  mock(mockRepo.master);

  expect(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github).toEqual({
    path: 'index.js',
    url: 'https://github.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
  });

  mock.restore();
});

it('malformed repository', function () {
  mock(mockRepo.malformed);

  expect(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github).toBe(undefined);

  mock.restore();
});

it('enterprise repository', function () {
  mock(mockRepo.enterprise);

  expect(evaluate(function () {
    /**
     * get one
     * @returns {number} one
     */
    function getOne() {
      return 1;
    }
  })[0].context.github).toEqual({
    path: 'index.js',
    url: 'https://github.enterprise.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
  });

  mock.restore();
});

'use strict';

/* eslint no-unused-vars: 0 */

var test = require('tap').test,
  mock = require('mock-fs'),
  path = require('path'),
  mockRepo = require('./git/mock_repo'),
  parse = require('../../lib/parsers/javascript'),
  github = require('../../lib/github');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  ).map(github);
}

const root = path.parse(__dirname).root;

function evaluate(fn) {
  return toComment(
    fn,
    root + path.join('my', 'repository', 'path', 'index.js')
  );
}

test('github', function(t) {
  mock(mockRepo.master);

  t.deepEqual(
    evaluate(function() {
      /**
     * get one
     * @returns {number} one
     */
      function getOne() {
        return 1;
      }
    })[0].context.github,
    {
      path: 'index.js',
      url: 'https://github.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
    },
    'gets github url'
  );

  mock.restore();

  t.end();
});

test('malformed repository', function(t) {
  mock(mockRepo.malformed);

  t.equal(
    evaluate(function() {
      /**
     * get one
     * @returns {number} one
     */
      function getOne() {
        return 1;
      }
    })[0].context.github,
    undefined,
    'does not crash'
  );

  mock.restore();

  t.end();
});

test('enterprise repository', function(t) {
  mock(mockRepo.enterprise);

  t.deepEqual(
    evaluate(function() {
      /**
     * get one
     * @returns {number} one
     */
      function getOne() {
        return 1;
      }
    })[0].context.github,
    {
      path: 'index.js',
      url: 'https://github.enterprise.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
    },
    'gets github enterprise url'
  );

  mock.restore();

  t.end();
});

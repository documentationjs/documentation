/* eslint no-unused-vars: 0 */

var mock = require('mock-fs'),
  path = require('path'),
  mockRepo = require('../utils').mockRepo,
  parse = require('../../src/parsers/javascript'),
  github = require('../../src/github');

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

test('github', function() {
  mock(mockRepo.master);

  expect(
    evaluate(function() {
      /**
   * get one
   * @returns {number} one
   */
      function getOne() {
        return 1;
      }
    })[0].context.github
  ).toEqual({
    path: 'index.js',
    url: 'https://github.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
  });

  mock.restore();
});

test('malformed repository', function() {
  mock(mockRepo.malformed);

  expect(
    evaluate(function() {
      /**
   * get one
   * @returns {number} one
   */
      function getOne() {
        return 1;
      }
    })[0].context.github
  ).toBe(undefined);

  mock.restore();
});

test('enterprise repository', function() {
  mock(mockRepo.enterprise);

  expect(
    evaluate(function() {
      /**
   * get one
   * @returns {number} one
   */
      function getOne() {
        return 1;
      }
    })[0].context.github
  ).toEqual({
    path: 'index.js',
    url: 'https://github.enterprise.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
  });

  mock.restore();
});

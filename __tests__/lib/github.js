/* eslint no-unused-vars: 0 */

const mock = require('mock-fs');
const path = require('path');
const mockRepo = require('../utils').mockRepo;
const parse = require('../../src/parsers/javascript');
const github = require('../../src/github');

// mock-fs is causing some unusual side effects with jest-resolve
// not being able to resolve modules so we've disabled these tests
// for now.

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

afterEach(function() {
  mock.restore();
});

test.skip('github', function() {
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
});

test.skip('malformed repository', function() {
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
});

test.skip('enterprise repository', function() {
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
    url:
      'https://github.enterprise.com/foo/bar/blob/this_is_the_sha/index.js#L6-L8'
  });
});

test.skip('typedef', function() {
  mock(mockRepo.master);

  expect(
    evaluate(function() {
      /**
       * A number, or a string containing a number.
       * @typedef {(number|string)} NumberLike
       */

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
    url: 'https://github.com/foo/bar/blob/this_is_the_sha/index.js#L2-L5'
  });
});

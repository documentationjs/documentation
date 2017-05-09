/* @flow */

var parseMarkdown = require('./parse_markdown');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');

/**
 * Sort two documentation objects, given an optional order object. Returns
 * a numeric sorting value that is compatible with stream-sort.
 *
 * @param {Array<Object>} comments all comments
 * @param {Object} options options from documentation.yml
 * @return {number} sorting value
 * @private
 */
module.exports = function sortDocs(comments: Array<Comment>, options: Object) {
  if (!options || !options.toc) {
    return sortComments(comments, options && options.sortOrder);
  }
  var indexes = options.toc.reduce(function(memo, val, i) {
    if (typeof val === 'object' && val.name) {
      val.kind = 'note';
      memo[val.name] = i;
    } else {
      memo[val] = i;
    }
    return memo;
  }, Object.create(null));
  var toBeSorted = options.toc.reduce(function(memo, val) {
    if (typeof val === 'string') {
      memo[val] = false;
    }
    return memo;
  }, Object.create(null));
  // Table of contents 'theme' entries: defined as objects
  // in the YAML list
  var fixed = options.toc
    .filter(val => typeof val === 'object' && val.name)
    .map(function(val) {
      if (typeof val.file === 'string') {
        var filename = val.file;
        if (!path.isAbsolute(val.file)) {
          filename = path.join(process.cwd(), val.file);
        }

        try {
          val.description = fs.readFileSync(filename).toString();
          delete val.file;
        } catch (err) {
          process.stderr.write(chalk.red(`Failed to read file ${filename}`));
        }
      }
      if (typeof val.description === 'string') {
        val.description = parseMarkdown(val.description);
      }
      return val;
    });
  var unfixed = [];
  comments.forEach(function(comment) {
    // If comment is of kind 'note', this means that we must be _re_ sorting
    // the list, and the TOC note entries were already added to the list. Bail
    // out here so that we don't add duplicates.
    if (comment.kind === 'note') {
      return;
    }

    // If comment is top-level and `name` matches a TOC entry, add it to the
    // to-be-sorted list.
    if (!comment.memberof && indexes[comment.name] !== undefined) {
      fixed.push(comment);
      toBeSorted[comment.name] = true;
    } else {
      unfixed.push(comment);
    }
  });
  fixed.sort((a, b) => {
    if (indexes[a.name] !== undefined && indexes[b.name] !== undefined) {
      return indexes[a.name] - indexes[b.name];
    }
  });
  sortComments(unfixed, options.sortOrder);
  Object.keys(toBeSorted)
    .filter(key => toBeSorted[key] === false)
    .forEach(key => {
      process.stderr.write(
        chalk.red(
          'Table of contents defined sorting of ' +
            key +
            ' but no documentation with that namepath was found\n'
        )
      );
    });
  return fixed.concat(unfixed);
};

function compare(a: string, b: string) {
  return a.localeCompare(b, undefined, { caseFirst: 'upper' });
}

function compareCommentsByName(a, b) {
  var akey = a.memberof || a.name;
  var bkey = b.memberof || b.name;

  if (akey && bkey) {
    return compare(akey, bkey);
  }
  return 0;
}

function compareCommentsBySourceLocation(a, b) {
  return a.context.sortKey.localeCompare(b.context.sortKey);
}

function sortComments(comments, sortOrder) {
  return comments.sort(
    sortOrder === 'alpha'
      ? compareCommentsByName
      : compareCommentsBySourceLocation
  );
}

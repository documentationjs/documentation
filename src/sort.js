const parseMarkdown = require('./remark-parse');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

/**
 * Sort two documentation objects, given an optional order object. Returns
 * a numeric sorting value that is compatible with stream-sort.
 *
 * @param {Array<Object>} comments all comments
 * @param {Object} options options from documentation.yml
 * @returns {number} sorting value
 * @private
 */
module.exports = function sortDocs(comments, options) {
  if (!options || !options.toc) {
    return sortComments(comments, options && options.sortOrder);
  }
  let i = 0;
  const indexes = Object.create(null);
  const toBeSorted = Object.create(null);
  const paths = Object.create(null);
  const fixed = [];
  const walk = function (tocPath, val) {
    if (typeof val === 'object' && val.name) {
      val.kind = 'note';
      indexes[val.name] = i++;
      if (typeof val.file === 'string') {
        let filename = val.file;
        if (!path.isAbsolute(val.file)) {
          filename = path.join(process.cwd(), val.file);
        }

        try {
          val.description = fs.readFileSync(filename).toString();
          delete val.file;
        } catch (err) {
          process.stderr.write(chalk.red(`Failed to read file ${filename}`));
        }
      } else if (!val.description) {
        val.description = '';
      }
      if (typeof val.description === 'string') {
        val.description = parseMarkdown(val.description);
      }
      const childPath = tocPath.concat({ scope: 'static', name: val.name });
      val.path = childPath;
      if (val.children) {
        val.children.forEach(walk.bind(null, childPath));
      }
      fixed.push(val);
    } else {
      indexes[val] = i++;
      toBeSorted[val] = false;
      paths[val] = tocPath.concat({ scope: 'static', name: val, toc: true });
    }
  };
  // Table of contents 'theme' entries: defined as objects
  // in the YAML list
  options.toc.forEach(walk.bind(null, []));
  const unfixed = [];
  comments.forEach(function (comment) {
    let commentPath;
    if (!comment.memberof && (commentPath = paths[comment.name])) {
      comment.path = commentPath;
      delete paths[comment.name];
    }

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
    return 0;
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

function compareCommentsByName(a, b) {
  const akey = a.name;
  const bkey = b.name;

  if (akey && bkey) {
    return akey.localeCompare(bkey, undefined, { caseFirst: 'upper' });
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

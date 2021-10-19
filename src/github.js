import path from 'path';
import findGit from './git/find_git.js';
import { getGithubURLPrefix } from './git/url_prefix.js';

/**
 * Attempts to link code to its place on GitHub.
 *
 * @name linkGitHub
 * @param {Object} comment parsed comment
 * @returns {Object} comment with github inferred
 */
export default function (comment) {
  const paths = findGit(comment.context.file);

  const urlPrefix = paths && getGithubURLPrefix(paths);

  if (urlPrefix) {
    const fileRelativePath = comment.context.file
      .replace(paths.root + path.sep, '')
      .split(path.sep)
      .join('/');

    let startLine;
    let endLine;

    if (comment.kind == 'typedef') {
      startLine = comment.loc.start.line;
      endLine = comment.loc.end.line;
    } else {
      startLine = comment.context.loc.start.line;
      endLine = comment.context.loc.end.line;
    }

    comment.context.github = {
      url:
        urlPrefix + fileRelativePath + '#L' + startLine + '-' + 'L' + endLine,
      path: fileRelativePath
    };
  }
  return comment;
}

const findAndReplace = require('mdast-util-find-and-replace');

/**
 * A remark plugin that installs
 * for JSDoc inline `{@link}` and `{@tutorial}` tags.
 *
 * This does not handle the `[text]({@link url})` and `[text]({@tutorial url})` forms of these tags.
 * That's a JSDoc misfeature; just use regular markdown syntax instead: `[text](url)`.
 *
 * @returns {Function}
 */
module.exports = function () {
  function replace(type) {
    return (match, matchUrl, matchValue) => {
      return {
        type,
        url: matchUrl,
        title: null,
        jsdoc: true,
        children: [
          {
            type: 'text',
            value: matchValue || matchUrl
          }
        ]
      };
    };
  }

  return function transform(markdownAST) {
    return findAndReplace(markdownAST, [
      [/\{@link\s+(.+?)(?:[\s|](.*?))?\}/g, replace('link')],
      [/\{@tutorial\s+(.+?)(?:[\s|](.*?))?\}/g, replace('tutorial')]
    ]);
  };
};

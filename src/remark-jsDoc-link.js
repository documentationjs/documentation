const findAndReplace = require('mdast-util-find-and-replace');
const markdownLineEnding = require('micromark/dist/character/markdown-line-ending');

const link = '@link';
const tutorial = '@tutorial';

function tokenizeJsDoclink(effects, ok, nok) {
  let index = 0;
  let focus = link;

  function atext(code) {
    if (index !== link.length) {
      if (focus.charCodeAt(index) === code) {
        effects.consume(code);
        index++;
        return atext;
      } else if (tutorial.charCodeAt(index) === code) {
        focus = tutorial;
      }
      return nok(code);
    }
    if (code === 125) {
      effects.consume(code);
      effects.exit('literalJsDoclink');
      return ok(code);
    }

    if (markdownLineEnding(code)) {
      return nok(code);
    }

    effects.consume(code);
    return atext;
  }

  return function (code) {
    effects.enter('literalJsDoclink');
    effects.consume(code);
    return atext;
  };
}

const text = {};
text[123] = {
  tokenize: tokenizeJsDoclink,
  previous(code) {
    return code === null || code === 32 || markdownLineEnding(code);
  }
};

const linkRegExp = /\{@link\s+(.+?)(?:[\s|](.*?))?\}/;
const tutorialRegExp = /\{@tutorial\s+(.+?)(?:[\s|](.*?))?\}/;

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
  const data = this.data();
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

  add('micromarkExtensions', { text });
  add('fromMarkdownExtensions', {
    transforms: [
      function (markdownAST) {
        return findAndReplace(markdownAST, [
          [new RegExp(linkRegExp.source, 'g'), replace('link')],
          [new RegExp(tutorialRegExp.source, 'g'), replace('tutorial')]
        ]);
      }
    ],
    enter: {
      literalJsDoclink(token) {
        const str = this.sliceSerialize(token);
        let match = null;
        if (str.startsWith('{@link')) {
          match = linkRegExp.exec(str);
        } else {
          match = tutorialRegExp.exec(str);
        }

        this.enter(replace('link')(...match), token);
      }
    },
    exit: {
      literalJsDoclink(token) {
        this.exit(token);
      }
    }
  });
  function add(field, value) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }
};

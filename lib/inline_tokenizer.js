'use strict';

function makeTokenizer(type, regex) {
  var tokenizer = function (eat, value, silent) {
    var match = regex.exec(value);

    if (!match) {
      return;
    }

    if (silent) {
      return true;
    }

    return eat(match[0])({
      'type': type,
      'url': match[1],
      'title': null,
      'children': [{
        'type': 'text',
        'value': match[2] || match[1]
      }]
    });
  };

  tokenizer.notInLink = true;
  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf('{@' + type, fromIndex);
  };

  return tokenizer;
}

var tokenizeLink = makeTokenizer('link', /^\{@link\s+(.+?)(?:[\s|](.*?))?\}/);
var tokenizeTutorial = makeTokenizer('tutorial', /^\{@tutorial\s+(.+?)(?:[\s|](.*?))?\}/);

/**
 * A remark plugin that installs
 * [tokenizers](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md#function-tokenizereat-value-silent)
 * and [locators](https://github.com/wooorm/remark/blob/master/doc/remarkplugin.3.md#function-locatorvalue-fromindex)
 * for JSDoc inline `{@link}` and `{@tutorial}` tags.
 *
 * This does not handle the `[text]({@link url})` and `[text]({@tutorial url})` forms of these tags.
 * That's a JSDoc misfeature; just use regular markdown syntax instead: `[text](url)`.
 *
 * @param {Object} processor - remark instance
 * @returns {undefined}
 */
module.exports = function (processor) {
  var proto = processor.Parser.prototype;
  proto.inlineTokenizers.tokenizeLink = tokenizeLink;
  proto.inlineTokenizers.tokenizeTutorial = tokenizeTutorial;
  var methods = proto.inlineMethods;
  methods.splice(methods.indexOf('inlineText'), 0,
    'tokenizeLink', 'tokenizeTutorial');
};

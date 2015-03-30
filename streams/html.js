'use strict';

var through = require('through'),
  Remarkable = require('remarkable'),
  extend = require('extend');

var defaultTags = ['author', 'classdesc', 'description',
  'param', 'property', 'returns', 'see', 'throws'];

/**
 * Create a transform stream that parses Markdown in the 'description'
 * tag and formats it as HTML.
 *
 * @param {Object} markdownOptions Options given to the Remarkable Markdown parser.
 * @param {Array<String>} [overrideTags=author,classdesc,description,param,property,returns,see,throws]
 * Tags which will be parsed and translated.
 * @name markdown
 * @return {stream.Transform}
 */
module.exports = function (opts, overrideTags) {
  var tagsToParse = overrideTags || defaultTags;
  var md = new Remarkable(opts);
  return through(function (comment) {

    var description = (tagsToParse.indexOf('description') !== -1 &&
      comment.description) ? {
      description: md.render(comment.description)
    } : {};

    var parsedTags = comment.tags ? {
      tags: comment.tags.map(function (tag) {
        return tagsToParse.indexOf(tag.title) !== -1 ?
          extend({}, tag, {
            description: md.render(tag.description)
          }) : tag;
      })
    } : {};

    this.push(extend({}, comment, parsedTags, description));
  });
};

var through = require('through'),
  table = require('markdown-table');

function tagsByType(data, type) {
  return data.tags.filter(function (tag) {
    return (tag.title === type);
  });
}

function tagByTypes(data, types) {
  for (var i = 0; i < types.length; i++) {
    var tags = tagsByType(data, types[ i ]);
    if (tags.length) return tags[ 0 ];
  }
}

function removeNewlines(str) {
  return str.replace('\n', ' ');
}

module.exports = function () {

  function markdownGeneratorStream(data) {

    var title = tagByTypes(data, [ 'name', 'alias', 'function', 'func', 'method' ]);

    if (title) {
      this.push('## ' + title.name + '\n\n');
    }

    var parameters = tagsByType(data, 'param');

    if (parameters.length) {
      this.push(table([[ 'name', 'description' ]]
        .concat(parameters.map(function (parameter) {
          return [
            '`' + parameter.name + '`',
            removeNewlines(parameter.description)
          ];
        }))));
    }

    this.push('\n\n' + data.description + '\n\n');
  }

  return through(markdownGeneratorStream);
};

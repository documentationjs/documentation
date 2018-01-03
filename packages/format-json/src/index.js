const File = require('vinyl');

module.exports = async function (comments: Array<Comment>) {
  return [new File({
    path: 'docs.json',
    content: JSON.stringify(comments, 2, null)
  })]
}
# Using documentation.js as a node library

You might want to do this if you're

* building an integration, like our gulp or grunt integrations
* using documentation.js's AST parsing or some other component
* mad science

Basic concepts:

* documentation.js takes an array of entry points, which can be filenames
  or objects with `source` and `file` members
* generating documentation is a two-step process: parsing, in the
  documentation.build and documentation.buildSync methods, and generating
  output in documentation.formats.md, json, or html.

### Example

```js
var documentation = require('./');

var docs = documentation.buildSync([{
  source: '/** hi this is a doc\n@name myDoc */',
  file: 'direct.js'
}]);

documentation.formats.md(docs, {}, function(err, res) {
  console.log(res);
});
```

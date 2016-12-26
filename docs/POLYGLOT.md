# About documentation.js, polyglot mode, and file extensions

Base assumptions:

* documentation.js subsists on a combination of _source comments_ and
  _smart inferences from source code_.
* The default mode of documentation.js is parsing JavaScript, but it has another
  mode, called `--polyglot` mode, that doesn't include any inference at all
  and lets you document other kinds of source code.
* The default settings for everything should work for most projects, but
  this is a guide for if you have a particular setup.

## File extensions

Let's talk about file extensions. We have two different flags for controlling
file extensions: `requireExtension` and `parseExtension`.

* requireExtension adds additional filetypes to the node.js `require()` method.
  By default, you can call, for instance, `require('foo')`, and the require algorithm
  will look for `foo.js`, `foo` the module, and `foo.json`. Adding another
  extension in requireExtension lets it look for `foo.otherextension`.
* parseExtension adds additional filetypes to the list of filetypes documentation.js
  thinks it can parse, and it also adds those additional filetypes to the default
  files it looks for when you specify a directory or glob as input.

## Polyglot

Polyglot mode switches documentation.js from running on babylon and [babel](https://babeljs.io/)
as a JavaScript parser, to using [get-comments](https://github.com/tunnckocore/get-comments).
This lets it grab comments formatted in the `/** Comment */` style from source
code that _isn't_ JavaScript, like C++ or CSS code.

Since documentation.js doesn't _parse_ C++ and lots of other languages (parsing JavaScript is complicated enough!),
it can't make any of its smart inferences about their source code: it just
takes documentation comments and shows them as-is.

You _can_ use polyglot mode to turn off inference across the board, but I don't recommend
it. See the 'too much inference' topic in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
for detail about that.

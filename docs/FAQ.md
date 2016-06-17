## What is `documentation`?

This is a documentation generation system targeting JavaScript code and implemented
in JavaScript. It exposes multiple interfaces for users:

* with `npm i -g documentation`, it provides a binary for command-line usage
* install `documentation` with `npm` to use the node-facing interace

`documentation` runs in [node.js](https://nodejs.org/) but supports JavaScript
that runs in _any environment_: you can use it to document browser libraries,
server libraries, or even things that use RequireJS or other module systems.

## How do I use `documentation`?

There are two main ways:

* You use the `documentation` command on your command-line to generate docs
  from your source code
* You use one of the integrations with a build system like Gulp to generate
  docs from source code.

## How does `documentation` differ from JSDoc?

JSDoc is both a **standard syntax for documentating code** as well as a
application, also called `jsdoc`, that processes that syntax into documentation.

`documentation` uses the JSDoc syntax and provides an alternative to the `jsdoc`
application.

## Why use `documentation` instead of JSDoc?

`documentation` aims to modernize and simplify the process of generating JavaScript
documentation.

* Beatiful defaults for HTML & Markdown output
* Supports CommonJS `require()` syntax so that node modules can be documented
  by giving their `main` file
* Heavily documented internally: all public and private functions in `documentation`
  are documented. [JSDoc is not well documented internally](https://github.com/jsdoc3/jsdoc/issues/839).
* Robust ES6 support
* [No Rhino cruft](https://github.com/jsdoc3/jsdoc/issues/942)
* Uses JSON literal objects for data representation instead of the [abandoned](https://github.com/typicaljoe/taffydb/graphs/contributors)
  and [untagged](https://github.com/jsdoc3/jsdoc/blob/master/package.json#L25) [TaffyDB](http://www.taffydb.com/) project.
* Uses high-quality node modules for syntax parsing, argument parsing, and other
  tasks: separates concerns so that we can focus on a robust solution
* Customization points like plugins & templates are heavily documented and
  made to be flexible

## Why use `documentation` instead of writing a Markdown file by hand?

* `documentation` can generate multiple formats: when you create a project
  website, it can take the structure of your documentation and generate
  beautiful HTML output
* The JSDoc syntax exposes a powerful, standardized type syntax to make it
  simple and clear to express parameter types like 'an array of strings'
  as `Array<String>`, and to support custom object types with inter-linking
* The [eslint valid-jsdoc rule](http://eslint.org/docs/rules/valid-jsdoc.html)
  makes it possible to require documentation as part of your linting step,
  ensuring that new code doesn't lower documentation coverage.

## Which files does documentation.js include?

By default, `documentation.js` follows dependencies within your source tree
and excludes `node_modules` from results. This is meant to include your application
code automatically but avoid documenting the random npm modules you're
using.

This means that if you point `documentation.js` at your `index.js` file and
that file uses `require` or `import` to include other source files,
those source files will be documented too.

You can customize this behavior by specifying the `--shallow` command-line
option. With `--shallow` specified, dependendencies aren't followed: documentation.js
documents only the files you explicitly name.

## Will adding JSDoc comments slow down my code?

The short answer is "no".

* As far as **execution performance** - how fast your code runs -
  all JavaScript implementations like V8 or SpiderMonkey will remove
  comments from the generated low-level code that they run. In other words,
  your browser does not run JavaScript as a string of code - it parses your
  code into an intermediate representation that ignores comments, and in this
  system comments, as well as whitespace, have no effect on performance.
* As far as **download performance** - whether these comments add kilobytes to
  website's download time - any typical code minifier
  like [UglifyJS](https://github.com/mishoo/UglifyJS) or [Closure Compiler](https://developers.google.com/closure/compiler/)
  removes comments by default when compressing your code.

# documentation

[![Circle CI](https://circleci.com/gh/documentationjs/documentation/tree/master.svg?style=svg)](https://circleci.com/gh/documentationjs/documentation/tree/master)
[![npm version](https://badge.fury.io/js/documentation.svg)](http://badge.fury.io/js/documentation)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/documentationjs/documentation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![David](https://david-dm.org/documentationjs/documentation.svg)](https://david-dm.org/documentationjs/documentation)
[![codecov.io](https://codecov.io/github/documentationjs/documentation/coverage.svg?branch=master)](https://codecov.io/github/documentationjs/documentation?branch=master)
[![Inline docs](http://inch-ci.org/github/documentationjs/documentation.svg?branch=master&style=flat-square)](http://inch-ci.org/github/documentationjs/documentation)

A **documentation generation system** that's
_beautiful_ by default, _flexible_ across formats and styles, and
_powerful_ enough to support [JSDoc](http://usejsdoc.org/)'s advanced syntax.

**ES5 and ES6 support of JavaScript, with support for other transpilers a possibility**

Using [babel](https://babeljs.io/), we have support for a wide range
of [ES6 & ES7 features](https://github.com/lukehoban/es6features), as well
as [Flow](http://flowtype.org/) type annotations.

**Powerful inference**

By statically analyzing your JavaScript code, documentation.js can write
many parts of your documentation for you. It can infer parameter names
and types, class membership, return values from Flow types, and lots more.

**Support for C++**

You can use the `--polyglot` mode of documentationjs to document native node.js
modules in JSDoc _within the C++ code that implements the feature_.

**Support for following dependency trees**

Using [module-deps](https://github.com/substack/module-deps), `documentation` can
crawl `require()` graphs - pointing it to your app's `main` file will find all
referenced files and include all of their documentation.

**GitHub Integration**

The `--github` option automatically permalinks documentation to the exact
sections of code it refers to in a GitHub repository.

**Gulp integration**

The [gulp-documentation](https://github.com/documentationjs/gulp-documentation) project
lets you run `documentation` as a [Gulp](http://gulpjs.com/) build task.

## Examples

* [HTML output with default template](http://documentation.js.org/html-example/)
* [Markdown](https://github.com/documentationjs/documentation/blob/master/docs/NODE_API.md)
* [JSON](http://documentation.js.org/html-example/index.json)

## Documentation

* [Getting Started](docs/GETTING_STARTED.md): start here
* [Usage](docs/USAGE.md): how to use documentation.js
* [Recipes](docs/RECIPES.md): tricks for writing effective JSDoc docs
* [Node API](docs/NODE_API.md): documentation.js's self-generated documentation
* [Configuring documentation.js](docs/CONFIG.md)
* [FAQ](docs/FAQ.md)
* [Troubleshooting](docs/TROUBLESHOOTING.md)
* [Theming](docs/THEMING.md): tips for theming documentation output in HTML
* [See also](https://github.com/documentationjs/documentation/wiki/See-also): a list of projects similar to documentation.js

## User Guide

Globally install `documentation` using the [npm](https://www.npmjs.com/) package manager:

```sh
$ npm install -g documentation
```

This installs a command called `documentation` in your path, that you can
point at [JSDoc](http://usejsdoc.org/)-annotated source code to generate
human-readable documentation. First run `documentation` with the `-h`
option for help:

```sh
$ documentation -h
Usage: documentation <command> [options]

Options:
  --lint             check output for common style and uniformity mistakes
                                                                       [boolean]
  -t, --theme        specify a theme: this must be a valid theme module
  -p, --private      generate documentation tagged as private          [boolean]
  --version          Show version number                               [boolean]
  --name             project name. by default, inferred from package.json
  --project-version  project version. by default, inferred from package.json
  --shallow          shallow mode turns off dependency resolution, only
                     processing the specified files (or the main script
                     specified in package.json)       [boolean] [default: false]
  --polyglot         polyglot mode turns off dependency resolution and enables
                     multi-language support. use this to document c++  [boolean]
  -g, --github       infer links to github in documentation            [boolean]
  -o, --output       output location. omit for stdout, otherwise is a filename
                     for single-file outputs and a directory name for multi-file
                     outputs like html                       [default: "stdout"]
  -c, --config       configuration file. an array defining explicit sort order
  -h, --help         Show help                                         [boolean]
  -f, --format                 [choices: "json", "md", "html"] [default: "json"]

Examples:
  documentation foo.js  parse documentation in a given file
```

## [Contributing](CONTRIBUTING.md)

_We have plenty of
[issues](https://github.com/documentationjs/documentation/issues) that we'd
love help with._

* Robust and complete `JSDoc` support, including typedefs.
* Strong support for HTML and Markdown output
* Documentation coverage, statistics, and validation

documentation is an OPEN Open Source Project. This means that:

Individuals making significant and valuable contributions are given
commit-access to the project to contribute as they see fit. This
project is more like an open wiki than a standard guarded open source project.

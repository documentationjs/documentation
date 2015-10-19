# documentation

[![Build Status](https://circleci.com/gh/documentationjs/documentation.svg?style=svg)](https://circleci.com/gh/documentationjs/documentation) [![Coverage Status](https://coveralls.io/repos/documentationjs/documentation/badge.svg?branch=master)](https://coveralls.io/r/documentationjs/documentation?branch=master)
[![npm version](https://badge.fury.io/js/documentation.svg)](http://badge.fury.io/js/documentation)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/documentationjs/documentation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A **documentation generation system** that's
_beautiful_ by default, _flexible_ across formats and styles, and
_powerful_ enough to support [JSDoc](http://usejsdoc.org/)'s advanced syntax.

**ES5 and ES6 support of JavaScript, with support for other transpilers a possibility**

Using [espree](https://github.com/eslint/espree), we have support for a wide range of [ES6 features](https://github.com/lukehoban/es6features).

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
  -f, --format   output format, of [json, md, html]            [default: "json"]
  --lint         check output for common style and uniformity mistakes          
  -t, --theme    specify a theme: this must be a valid theme module             
  -p, --private  generate documentation tagged as private                       
  --name         project name. by default, inferred from package.json           
  --version      project version. by default, inferred from package.json        
  --shallow      shallow mode turns off dependency resolution, only processing
                 the specified files (or the main script specified in
                 package.json)                                  [default: false]
  --polyglot     polyglot mode turns off dependency resolution and enables
                 multi-language support. use this to document c++               
  -g, --github   infer links to github in documentation                         
  -o, --output   output location. omit for stdout, otherwise is a filename for
                 single-file outputs and a directory name for multi-file
                 outputs like html                           [default: "stdout"]
  -c, --config   configuration file. an array defining explicit sort order      
  -h, --help     Show help                                                      

Examples:
  documentation foo.js    parse documentation in a given file
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

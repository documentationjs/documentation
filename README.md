# documentation

[![Build Status](https://circleci.com/gh/documentationjs/documentation.svg?style=svg)](https://circleci.com/gh/documentationjs/documentation)

This would be a big one, we would need the whole town to pitch in.

The mission is to create a **documentation generation system** that's
_beautiful_ by default, _flexible_ across formats and styles, and
_powerful_ enough to support [JSDoc](http://usejsdoc.org/)'s advanced syntax.

_We also have plenty of
[issues](https://github.com/documentationjs/documentation/issues) that we'd
love help with._

## Completed Goals

**ES5 and ES6 support of JavaScript, with support for other transpilers a possibility**

Using [espree](https://github.com/eslint/espree), we have support for a wide range of [ES6 features](https://github.com/lukehoban/es6features).

**Support for following dependency trees**

Using [module-deps](https://github.com/substack/module-deps), `documentation` can
crawl `require()` graphs - pointing it to your app's `main` file will find all
referenced files and include all of their documentation.

**GitHub Integration**

The `--github` option automatically permalinks documentation to the exact
sections of code it refers to in a GitHub repository.

**Dash Support**

The `-f docset` output option creates documentation compatible with
the excellent [Dash](https://kapeli.com/) documentation tool.

[**Gulp integration**](https://github.com/documentationjs/gulp-documentation)

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
  -f, --format   output format, of [json, md, html, docset]    [default: "json"]
  --lint         check output for common style and uniformity mistakes
  --mdtemplate   markdown template: should be a file with Handlebars syntax
  -p, --private  generate documentation tagged as private
  -g, --github   infer links to github in documentation
  -o, --output   output location. omit for stdout, otherwise is a filename for
                 single-file outputs and a directory name for multi-file
                 outputs like html                           [default: "stdout"]
  -h, --help     Show help

Examples:
  documentation foo.js    parse documentation in a given file
```

# Future Goals

* Robust and complete `JSDoc` support, including typedefs.
* Strong support for HTML and Markdown output
* Documentation coverage, statistics, and validation

## [Contributing](CONTRIBUTING.md)

documentation is an OPEN Open Source Project. This means that:

Individuals making significant and valuable contributions are given
commit-access to the project to contribute as they see fit. This
project is more like an open wiki than a standard guarded open source project.

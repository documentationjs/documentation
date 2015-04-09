# documentation

[![Build Status](https://circleci.com/gh/documentationjs/documentation.svg?style=svg)](https://circleci.com/gh/documentationjs/documentation)

This would be a big one, we would need the whole town to pitch in.

The mission is to create a **documentation generation system** that's
_beautiful_ by default, _flexible_ across formats and styles, and
_powerful_ enough to support JSDoc's advanced syntax.

_We also have plenty of
[issues](https://github.com/documentationjs/documentation/issues) that we'd
love help with._

## Completed Goals

**ES5 and ES6 support of JavaScript, with support for other transpilers a possibility**

Using [espree](https://github.com/eslint/espree), we have support for a wide range of ES6 features.

**Support for following dependency trees**

Using [module-deps](https://github.com/substack/module-deps), `documentation` can crawl `require()` graphs - pointing it to your app's `main` file will find all referenced files and include all of their documentation.

**GitHub Integration**

The `--github` option automatically permalinks documentation to the exact
sections of code it refers to in a GitHub repository.

**Dash Support**

The `-f docset` output option creates documentation compatible with
the excellent [Dash](https://kapeli.com/) documentation tool.

# Future Goals

* Robust and complete `JSDoc` support, including typedefs.
* Strong support for HTML and Markdown output
* Simple integration with build systems like [Makefiles](http://mrbook.org/blog/tutorials/make/),
  [Gulp](http://gulpjs.com/), and [Grunt](http://gruntjs.com/)
* Documentation coverage, statistics, and validation

## [Contributing](CONTRIBUTING.md)

documentation is an OPEN Open Source Project. This means that:

Individuals making significant and valuable contributions are given
commit-access to the project to contribute as they see fit. This
project is more like an open wiki than a standard guarded open source project.

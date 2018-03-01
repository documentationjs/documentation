<p align="center">
  <img src="./.github/documentation-js-logo.png" width="650" />
</p>

<p align="center">
  The documentation system for modern JavaScript
</p>

[![Greenkeeper badge](https://badges.greenkeeper.io/documentationjs/documentation.svg)](https://greenkeeper.io/)
[![Circle CI](https://circleci.com/gh/documentationjs/documentation/tree/master.svg?style=shield)](https://circleci.com/gh/documentationjs/documentation/tree/master)
[![npm version](https://badge.fury.io/js/documentation.svg)](http://badge.fury.io/js/documentation)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/documentationjs/documentation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![David](https://david-dm.org/documentationjs/documentation.svg)](https://david-dm.org/documentationjs/documentation)
[![Coverage Status](https://coveralls.io/repos/github/documentationjs/documentation/badge.svg?branch=master)](https://coveralls.io/github/documentationjs/documentation?branch=master)
[![Inline docs](http://inch-ci.org/github/documentationjs/documentation.svg?branch=master&style=flat-square)](http://inch-ci.org/github/documentationjs/documentation)

* Supports modern JavaScript: ES5, ES2017, JSX, and [Flow](http://flowtype.org/) type annotations.
* Infers parameters, types, membership, and more. Write less documentation: let the computer write it for you.
* Integrates with GitHub to link directly from documentation to the code it refers to.
* Customizable output: HTML, JSON, Markdown, and more

## Examples

-   [HTML output with default template](http://documentation.js.org/html-example/)
-   [Markdown](https://github.com/documentationjs/documentation/blob/master/docs/NODE_API.md)
-   [JSON](http://documentation.js.org/html-example/index.json)

## Documentation

-   [Getting Started](docs/GETTING_STARTED.md): start here
-   [Usage](docs/USAGE.md): how to use documentation.js
-   [Recipes](docs/RECIPES.md): tricks for writing effective JSDoc docs
-   [Node API](docs/NODE_API.md): documentation.js's self-generated documentation
-   [Configuring documentation.js](docs/CONFIG.md)
-   [FAQ](docs/FAQ.md)
-   [Troubleshooting](docs/TROUBLESHOOTING.md)
-   [Theming](docs/THEMING.md): tips for theming documentation output in HTML
-   [See also](https://github.com/documentationjs/documentation/wiki/See-also): a list of projects similar to documentation.js

## User Guide

Globally install `documentation` using the [npm](https://www.npmjs.com/) package manager:

```sh
$ npm install -g documentation
```

This installs a command called `documentation` in your path, that you can
point at [JSDoc](http://usejsdoc.org/)-annotated source code to generate
human-readable documentation. First, run `documentation` with the `--help`
option for help:

```sh
Usage:

# generate markdown docs for index.js and files it references
bin/documentation.js build index.js -f md

# generate html docs for all files in src
bin/documentation.js build src/** -f html -o docs

# document index.js, ignoring any files it requires or imports
bin/documentation.js build index.js -f md --shallow

# build and serve HTML docs for app.js
bin/documentation.js serve app.js

# build, serve, and live-update HTML docs for app.js
bin/documentation.js serve --watch app.js

# validate JSDoc syntax in util.js
bin/documentation.js lint util.js

# update the API section of README.md with docs from index.js
bin/documentation.js readme index.js --section=API

# build docs for all values exported by index.js
bin/documentation.js build --document-exported index.js

Commands:
  serve [input..]   generate, update, and display HTML documentation
  build [input..]   build documentation
  lint [input..]    check for common style and uniformity mistakes
  readme [input..]  inject documentation into your README.md

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## [Contributing](CONTRIBUTING.md)

_We have plenty of
[issues](https://github.com/documentationjs/documentation/issues) that we'd
love help with._

-   Robust and complete `JSDoc` support, including typedefs.
-   Strong support for HTML and Markdown output
-   Documentation coverage, statistics, and validation

documentation is an OPEN Open Source Project. This means that:

Individuals making significant and valuable contributions are given
commit-access to the project to contribute as they see fit. This
project is more like an open wiki than a standard guarded open source project.

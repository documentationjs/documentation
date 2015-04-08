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
* Expresses source transformations as chainable transform streams
* Robust ES6 support
* Uses high-quality node modules for syntax parsing, argument parsing, and other
  tasks: separates concerns so that we can focus on a robust solution

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

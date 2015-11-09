## 3.0.4

* Allow parameter types to be mixed into explicit parameter documentation. (#239 and #232)
* Support GitHub links in Markdown output (#238)

## 3.0.3

* Infer typedefs from Flow type aliases. Fixes #227
* Fix type-annotated rest expressions, raised in #230

## 3.0.2

* Infer rest parameters. Fixes #223
* Avoid filtering comments in lint mode. Fixes #186
* Nest both properties and params. Fixes #164

## 3.0.1

* BUGFIX: Fix default theme resolution [#212](https://github.com/documentationjs/documentation/pull/212)

## 3.0.0

The largest change to documentation.js so far.

**Dropping streams**

This a major refactor of the documentation.js interface with a focus on
simplifying the system. Up until this point, documentation.js was built around
[node.js streams](https://nodejs.org/api/stream.html), which are low-level
representations of asynchronous series of data. While this abstraction was
appropriate for the input and github streams, which are asynchronous, the
majority of documentation.js's internals are simple and synchronous functions
for which basic functional composition makes more sense than stream
semantics.

Documentation 3.0.0 uses simple functional composition for operations like
parmameter inference, rather than streams.

**Stronger support for ES6, ES7, and Flow**

We've switched to [Babel](https://babeljs.io/) as our source code parser,
which means that we have much broader support of new JavaScript features,
including import/export syntax and new features in ES6.

Babel also parses [Flow type annotations](http://flowtype.org/docs/type-annotations.html),
and new inference code means that we can infer

* Parameter names & types
* Return types

Without any explicit JSDoc tags. This means that for many simple functions,
we can generate great documentation with less writing.

**Stronger module support**

Documentation.js now has much better inference for membership and names of symbols
exported via `exports` or `module.exports`.

**Support for nested symbols**

The parent/child relationship between symbols is now fully hierarchical, and
symbols can be nested to any depth. For instance:

```
/**
 * A global Parent class.
 */
var Parent = function () {};

/**
 * A Child class.
 */
Parent.Child = function () {};

/**
 * A Grandchild class.
 */
Parent.Child.Grandchild = function () {};
```

In addition, filtering by access is now applied to the entire hierarchy: if you
mark a class as `@private`, neither it nor its children will be included in the
output by default, regardless of the access specifiers of the children.

**mdast-based Markdown output**

We've switched from templating Markdown output with [Handlebars.js](http://handlebarsjs.com/)
to generating an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
of desired output and stringifying it with [mdast](https://github.com/wooorm/mdast).
This lets documentation.js output complex Markdown without having to worry
about escaping and properly formatting certain elements.

**Test coverage 100%**

documentation.js returns to 100% test coverage, so every single line
of code is covered by our large library of text fixtures and specific tests.

**--lint mode**

Specifying the `--lint` flag makes documentation.js check for non-standard
types, like `String`, or missing namespaces. If the encountered files have
any problems, it pretty-prints helpful debug messages and exits with status 1,
and otherwise exits with no output and status 0.

**Breaking changes**

* The `--version` flag is now `--project-version`. `--version` now outputs
  documentation.js's version

## 2.0.1

* Fixes `@param` tags that refer to properties of unmentioned objects: these
  will warn instead of crashing. For instance, `/** @param {boolean} foo.bar */`.
* Expose `--shallow` option in CLI

## 2.0.0

* Breaking: Removes `docset` support from documentation.js: this will be supported
  by a 3rd party tool in the future. This removal means that we no longer have
  node-sqlite3 as a dependency, and documentation can be installed on systems
  without a compile toolchain.
* JSDoc parse errors are now printed to stderr.
* Parameter tags that document sub-parameters, such as `@param {Type} options.option`,
  are now nested under their parent parameter.
* HTML output now includes events.
* Error messages now include source file name and line number.
* @typedef names are now inferred correctly.

## 1.4.0

* Output for the `@throws` tag.
* Output in HTML for the `@properties` tag.

## 1.3.0

* Now infers `name` from `class` and `event` tags
* Support for documenting C++ code with the `polyglot` option and `--polyglot` CLI option
* Fixed github linking
* Support for [JSDoc3-style bracketed optional parameters](http://usejsdoc.org/tags-param.html#optional-parameters-and-default-values), like

```js
/**
 * @param {Type} [param=defaultValue]
 */
```

## 1.2.0

* Transforms in package.json `browserify.transform` fields are now applied to
  source code so that babel, etc can be supported.
* Fixes crash caused by requiring JSON files

## 1.1.0

* Add `external` option that allows the user to whitelist specific external
  modules to be included in with documentation.

## 1.0.7

* Fixes sorting order of documentation
* Switches order of static and instance members in output

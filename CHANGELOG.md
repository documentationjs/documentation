<a name="4.0.0-beta.18"></a>
# [4.0.0-beta.18](https://github.com/documentationjs/documentation/compare/v4.0.0-beta.17...v4.0.0-beta.18) (2016-12-29)


### Bug Fixes

* **cli:** Fix error reporting in the CLI ([88c8f9a](https://github.com/documentationjs/documentation/commit/88c8f9a))
* **markdown:** Start headings in Markdown at h2 (#644) ([2ae5d8f](https://github.com/documentationjs/documentation/commit/2ae5d8f))

### Features

* **bin:** Support globs on windows and use smarter recursion (#629) ([cb8fdfa](https://github.com/documentationjs/documentation/commit/cb8fdfa)), closes [#607](https://github.com/documentationjs/documentation/issues/607)
* **markdown:** Add table of contents support for Markdown mode (#645) ([4c66fb1](https://github.com/documentationjs/documentation/commit/4c66fb1))

### Performance Improvements

* **dependencies:** Move standard-changelog to devDependencies (#636) ([7a66b3f](https://github.com/documentationjs/documentation/commit/7a66b3f))



<a name="4.0.0-beta.17"></a>
# [4.0.0-beta.17](https://github.com/documentationjs/documentation/compare/v4.0.0-beta16...v4.0.0-beta.17) (2016-12-23)

This release also fixes a mistake I was making with semver: pre-v4 beta
releases will be called `beta.17` and `beta.18` and so on, rather than
non-standard `beta16` without the `.`.


### Bug Fixes

* **hierarchy:** collect events from static and instance members (#628) ([f1e0267](https://github.com/documentationjs/documentation/commit/f1e0267)), closes [#486](https://github.com/documentationjs/documentation/issues/486)



<a name="4.0.0-beta16"></a>
# [4.0.0-beta16](https://github.com/documentationjs/documentation/compare/v4.0.0-beta15...v4.0.0-beta16) (2016-12-07)


### Bug Fixes

* **bin:** Remove dead code in documentation.js command (#627) ([ab16a20](https://github.com/documentationjs/documentation/commit/ab16a20))
* **extractors:** Document export default value (#623) ([363a108](https://github.com/documentationjs/documentation/commit/363a108)), closes [#543](https://github.com/documentationjs/documentation/issues/543)
* **parser:** Avoid error about deoptimization on very large files (#621) ([846ab94](https://github.com/documentationjs/documentation/commit/846ab94))

### Features

* **build:** load passed in config option (#625) ([89fb67f](https://github.com/documentationjs/documentation/commit/89fb67f))
* **output:** Display type information for typedefs in Markdown and HTML ([8b04029](https://github.com/documentationjs/documentation/commit/8b04029))




<a name="4.0.0-beta15"></a>
# [4.0.0-beta15](https://github.com/documentationjs/documentation/compare/v4.0.0-beta14...v4.0.0-beta15) (2016-11-23)

### Fixes

* Infer class augments tag in cases like `Foo extends React.Component`

### Features

* **config:** add file property for notes ([#614](https://github.com/documentationjs/documentation/issues/614)) ([d96aa47](https://github.com/documentationjs/documentation/commit/d96aa47)), closes [#609](https://github.com/documentationjs/documentation/issues/609)



## 4.0.0-beta14

* Highlight all Markdown, not just examples. Fixes #610
* Fix for `--config` only strip comments on json files (#611)
* Merge inferred return type like we do for params. Refs #359 (#604)
* Support webpack's System.import with nice handy babel plugin (#603)
* Format optional types with ? instead of [] (#538)
* Fix membership assignment for old-fashioned prototype members (#599)
* Update Node API documentation to include only exposed API surface
* Add too-much-inference troubleshooting topic

## 4.0.0-beta13

* Fix linker null reference error

## 4.0.0-beta12

* Update Doctrine to handle more JSDoc types
* Fix ReferenceError in default theme
* Show GitHub link for nested elements in default theme
* Fix linking resolution order

## 4.0.0-beta11

* Improved support for Flow: function types, object types, mixed types, null,
  void, typedefs
* New option: [sort-order](https://github.com/documentationjs/documentation/pull/535)
* Updates to Babylon 6.10.x
* Updates to dependencies, including yargs.
* [`document-exported` now traverses only exported code](https://github.com/documentationjs/documentation/pull/533).

## 4.0.0-beta10

* Lower memory consumption when dealing with large codebases
* Better support for detecting names and kinds of ES6-exported values
* New `document-exported` flag allows you to automatically document
  ES6-exported values, without even a comment! [490](https://github.com/documentationjs/documentation/pull/490)

## 4.0.0-beta5

* Add decorator support (zacharygolba)
* Add support to infer whether functions are private based on their name,
  like starting with `_` (arv)
* Improve internal documentation

## 4.0.0-beta4

* Fix minor dependency mistake

## 4.0.0-beta3

* Updates theme to a much-improved design
* Fix augments tag display in HTML
* Improve name detection of ES6-exported methods and variables
* Allow documentation of Object.prototype methods

## 4.0.0-beta2

Minor fixes

* Fixes `export { foo } from './bar'` style export
* Fixed CLI usage examples to simply say `documentation` instead of `/usr/bin/documentation` or
  similar.

## 4.0.0-beta1

**Now using Babel 6!**

Much long-awaited upgrade makes documentation.js compatible with fresh
new Babel-using codebases.

And also:

* GitHub Enterprise support
* New tag support: abstract, override, readonly, interface, variation, see, todo
  (only in parsing phase, not yet in all outputs)
* Parses jsx and es6 extensions by default, as well as .js
* Fixes polyglot mode
* Now shows the `@throws` tag content in Markdown output
* Support for example captions

## 4.0.0-beta

**Revitalized documentation.js command line interface!**

The `documentation` utility now takes commands:

* `documentation build` extracts and formats documentation
* `documentation serve` provides an auto-reloading server ([#236](https://github.com/documentationjs/documentation/pull/236))
* `documentation lint` reviews files for inconsistencies
* `documentation readme` patches API documentation into a readme ([#313](https://github.com/documentationjs/documentation/pull/313) by @anandthakker)

This functionality was previously included in `dev-documentation` and has
been folded into `documentation` proper.

**Much more flexible themes**

Themes are now much more customizable. In documentation.js 3.x and before, themes
were required to use Handlebars templates and produce a single page. In
documentation.js 4.x and beyond, they are JavaScript modules that can use
any template engine and produce any number of files. See the
[new theme documentation](https://github.com/documentationjs/documentation/blob/master/docs/THEMING.md) for
details.

**More precise traversal**

Inference in 4.x is stricter than in 3.x: comments must be adjacent
to the statements they document. This should make documentation generation
much more predictable.

**Support for the revealing module pattern**

```js
/** Foo */
function Foo() {
  /** Test */
  function bar() {}
  return {
    bar: bar
  };
}
````

New support for the [JavaScript module pattern](http://www.macwright.org/2012/06/04/the-module-pattern.html)!
This was implemented in [#324](https://github.com/documentationjs/documentation/pull/324)
by [Charlie Brown](https://github.com/carbonrobot).

**Breaking changes**

* documentation.js now follows the [JSDoc standard's interpretation of the @name tag](http://usejsdoc.org/tags-name.html):
  specifying a name tag will turn off inference. If you still want inference
  but want to call code something else, use the [@alias tag](http://usejsdoc.org/tags-alias.html) instead.

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

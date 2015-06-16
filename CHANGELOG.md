## 2.0.0 [wip]

* Removes `docset` support from documentation.js: this will be supported
  by a 3rd party tool in the future
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

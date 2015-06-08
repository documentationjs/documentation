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

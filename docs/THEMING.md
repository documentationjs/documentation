Documentation.js supports customizable themes for HTML output. A theme is a Node.js
module that exports a single function with the following signature:

```
/**
 * @function
 * @param {Array<Object>} comments - an array of comments to be output
 * @param {Object} options - theme options
 * @param {ThemeCallback} callback - see below
 */

/**
 * @callback ThemeCallback
 * @param {?Error} error
 * @param {?Array<vinyl.File>} output
 */
```

The theme function should call the callback with either an error, if one occurs,
or an array of [vinyl](https://github.com/gulpjs/vinyl) `File` objects.

The theme is free to implement HTML generation however it chooses. See
[the default theme](https://github.com/documentationjs/documentation-theme-default/)
for some ideas.

# Goals

This intends to be a **semantic**, **complete**, and **flexible** documentation
tool for JavaScript.

* Robust and complete `JSDoc` support, including typedefs.
* Strong support for HTML and Markdown output
* Simple integration with build systems like Make, Gulp, and Grunt
* Documentation coverage, statistics, and validation

## Completed Goals

**ES5 and ES6 support of JavaScript, with support for other transpilers a possibility**

Using [espree](https://github.com/eslint/espree), we have support for a wide range of ES6 features.

**Support for following dependency trees**

Using [module-deps](https://github.com/substack/module-deps), `documentation` can crawl `require()` graphs - pointing it to your app's `main` file will find all referenced files and include all of their documentation.

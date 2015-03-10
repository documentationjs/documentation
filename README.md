# documentation

This would be a big one, we would need the whole town to pitch in.

* Use esprima or acorn to parse JavaScript
* Use doctrine for JSDoc comments and submit patches making it complete
* Prioritize JSON, Markdown, and HTML by default and make other outputs
  clear and simple to write
* Support browserify mode: documentation as a browserify transform
  that crawls dependency trees
* Be exhaustively documented internally
* Support coverage mode: report % of exported functions covered and integrate
  with a badge service to show this on GitHub repos
* Support configurable transforms, compatible with either browserify or browserpack
  style, to allow for usage of other languages

## Parser Streams

    file contents -> extracted comments

Parser streams receive the content returned by input streams and extract
JSDoc comments. The `javascript` stream goes further and also extracts
the [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
of JavaScript source code in order to help `documentation` infer things
about the source code's structure, like the naming of variables.

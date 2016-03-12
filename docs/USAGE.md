## Using `documentation` on the command line

Install the `documentation` binary with [npm](https://www.npmjs.com/).

```sh
$ npm install -g documentation
```

`documentation` then installs a command called `documentation`. Run it with
`-h` to get help.

```sh
Usage: documentation <command> [options]

Commands:
  build   build documentation
  serve   generate, update, and display HTML documentation
  lint    check for common style and uniformity mistakes
  readme  inject documentation into your README.md

Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --shallow        shallow mode turns off dependency resolution, only processing
                   the specified files (or the main script specified in
                   package.json)                      [boolean] [default: false]
  --config, -c     configuration file. an array defining explicit sort order
  --external       a string / glob match pattern that defines which external
                   modules will be whitelisted and included in the generated
                   documentation.                                [default: null]
  --extension, -e  only input source files matching this extension will be
                   parsed, this option can be used multiple times.
  --polyglot       polyglot mode turns off dependency resolution and enables
                   multi-language support. use this to document c++    [boolean]
  --private, -p    generate documentation tagged as private
                                                      [boolean] [default: false]
  --access, -a     Include only comments with a given access level, out of
                   private, protected, public, undefined. By default, public,
                   protected, and undefined access levels are included
                        [choices: "public", "private", "protected", "undefined"]
  --github, -g     infer links to github in documentation              [boolean]

Examples:
  documentation build foo.js  parse documentation in a given file
```

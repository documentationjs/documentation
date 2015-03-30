## Using `documentation` on the command line

Install the `documentation` binary with [npm](https://www.npmjs.com/).

```sh
$ npm install -g documentation
```

`documentation` then installs a command called `documentation`. Run it with
`-h` to get help.

```sh
$ documentation -h
Usage: bin/documentation.js <command> [options]

Options:
  -f, --format   output format, of [json, md]                  [default: "json"]
  --mdtemplate   markdown template: should be a file with Handlebars syntax
  -p, --private  generate documentation tagged as private
  -h, --help     Show help

Examples:
  documentation foo.js    parse documentation in a given file
```

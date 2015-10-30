## Using `documentation` on the command line

Install the `documentation` binary with [npm](https://www.npmjs.com/).

```sh
$ npm install -g documentation
```

`documentation` then installs a command called `documentation`. Run it with
`-h` to get help.

```sh
Usage: documentation <command> [options]

Options:
  --lint             check output for common style and uniformity mistakes
                                                                       [boolean]
  -t, --theme        specify a theme: this must be a valid theme module
  -p, --private      generate documentation tagged as private          [boolean]
  --version          Show version number                               [boolean]
  --name             project name. by default, inferred from package.json
  --project-version  project version. by default, inferred from package.json
  --shallow          shallow mode turns off dependency resolution, only
                     processing the specified files (or the main script
                     specified in package.json)       [boolean] [default: false]
  --polyglot         polyglot mode turns off dependency resolution and enables
                     multi-language support. use this to document c++  [boolean]
  -g, --github       infer links to github in documentation            [boolean]
  -o, --output       output location. omit for stdout, otherwise is a filename
                     for single-file outputs and a directory name for multi-file
                     outputs like html                       [default: "stdout"]
  -c, --config       configuration file. an array defining explicit sort order
  -h, --help         Show help                                         [boolean]
  -f, --format                 [choices: "json", "md", "html"] [default: "json"]

Examples:
  documentation foo.js  parse documentation in a given file
```

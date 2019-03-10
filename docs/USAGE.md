## Using `documentation` on the command line

Install the `documentation` binary with [npm](https://www.npmjs.com/).

```sh
$ npm install -g documentation
```

`documentation` then installs a command called `documentation`. Run it with
`--help` or `--help <command>` to get help.

```
$ documentation --help build

Options:
  --version                  Show version number                       [boolean]
  --help                     Show help                                 [boolean]
  --theme, -t                specify a theme: this must be a valid theme module
  --project-name             project name. by default, inferred from
                             package.json
  --project-version          project version. by default, inferred from
                             package.json
  --project-description      project description. by default, inferred from
                             package.json
  --project-homepage         project homepage. by default, inferred from
                             package.json
  --favicon                  favicon used in html
  --watch, -w                watch input files and rebuild documentation when
                             they change                               [boolean]
  --markdown-toc             include a table of contents in markdown output
                                                       [boolean] [default: true]
  --markdown-toc-max-depth   specifies the max depth of the table of contents in markdown output
                                                           [number] [default: 6]
  --shallow                  shallow mode turns off dependency resolution, only
                             processing the specified files (or the main script
                             specified in package.json)
                                                      [boolean] [default: false]
  --config, -c               configuration file. an array defining explicit sort
                             order                                      [string]
  --no-package, --np         dont find and use package.json for project-
                             configuration option defaults
                                                      [boolean] [default: false]
  --external                 a string / glob match pattern that defines which
                             external modules will be whitelisted and included
                             in the generated documentation.     [default: null]
  --require-extension, --re  additional extensions to include in require() and
                             import's search algorithm.For instance, adding .es5
                             would allow require("adder") to find "adder.es5"
  --parse-extension, --pe    additional extensions to parse as source code.
  --private, -p              generate documentation tagged as private
                                                      [boolean] [default: false]
  --access, -a               Include only comments with a given access level,
                             out of private, protected, public, undefined. By
                             default, public, protected, and undefined access
                             levels are included
                [array] [choices: "public", "private", "protected", "undefined"]
  --github, -g               infer links to github in documentation    [boolean]
  --infer-private            Infer private access based on the name. This is a
                             regular expression that is used to match the name
                                                                        [string]
  --document-exported        Generate documentation for all exported bindings
                             and members even if there is no JSDoc for them
                                                      [boolean] [default: false]
  --sort-order               The order to sort the documentation
                                [choices: "source", "alpha"] [default: "source"]
  --output, -o               output location. omit for stdout, otherwise is a
                             filename for single-file outputs and a directory
                             name for multi-file outputs like html
                                                             [default: "stdout"]
  --format, -f       [choices: "json", "md", "remark", "html"] [default: "json"]
```

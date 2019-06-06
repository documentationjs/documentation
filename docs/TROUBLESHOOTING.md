## Installing documentation with npm v1 or v2 yields a gigantic `node_modules`

Unfortunately, we need to recommend: use **yarn or npm v3** to install documentation.
npm v1 and v2 are unable to properly de-duplicate dependencies, so they will
create wastefully large `node_modules` directories under documentation.

## documentation is inferring _too much_ about my code

If you've written very dynamic JavaScript, all of documentation's intelligence
might not understand it. If:

* documentation is **wrong** in a clear way, please [open a descriptive issue](https://github.com/documentationjs/documentation/issues) with a code snippet and we can help!
* if it's **right** technically but you want to control your docs entirely,
  use the `@name` tag to declare the name of the thing (function, variable, etc)
  you're referring to, and the tool will not try to infer anything at all.

## Error: watch ENOSPC

Linux systems can have a low limit of 'watchable files'. To increase this
limit, follow [the advice in this StackOverflow answer](https://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc/17437601#17437601).

## Error: EMFILE: too many open files

You'll need to increase the `ulimit` maximum for your system: [here's a StackOverflow issue explaining how](https://unix.stackexchange.com/questions/108174/how-to-persistently-control-maximum-system-resource-consumption-on-mac).

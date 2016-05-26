## Error: watch ENOSPC

Linux systems can have a low limit of 'watchable files'. To increase this
limit, follow [the advice in this StackOverflow answer](http://stackoverflow.com/a/17437601/229001).

## Error: EMFILE: too many open files

You'll need to increase the `ulimit` maximum for your system: [here's a StackOverflow issue explaining how](http://unix.stackexchange.com/questions/108174/how-to-persist-ulimit-settings-in-osx-mavericks).

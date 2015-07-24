## Input Streams

Input streams are the source of content for `documentation`: they typically
accept an array of indexes: filenames as strings. They can return
the contents of those files, like in `shallow.js`, or go further and
resolve dependencies between modules, like in `dependency.js`.

As such, they are Readable streams.

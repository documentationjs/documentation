# documentation is an OPEN Open Source Project

-----------------------------------------

## What?

Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

## Rules

There are a few basic ground-rules for contributors:

1. **No `--force` pushes** or modifying the Git history in any way.
1. **Non-master branches** ought to be used for ongoing work.
1. **External API changes and significant modifications** ought to be subject to an **internal pull-request** to solicit feedback from other contributors.
1. Internal pull-requests to solicit feedback are *encouraged* for any other non-trivial contribution but left to the discretion of the contributor.
1. Contributors should attempt to adhere to the prevailing code-style.

## Releases

Declaring formal releases remains the prerogative of the project maintainer.

## Changes to this arrangement

This is an experiment and feedback is welcome! This document may also be subject to pull-requests or changes by contributors where you believe you have something valuable to add or change.

[this approach is totally cribbed from the excellent LevelUP project](https://github.com/Level/community/blob/master/CONTRIBUTING.md)

----

## Releasing

documentation aims to **release often**. We use [standard-changelog](https://github.com/conventional-changelog/standard-changelog)
to generate CHANGELOG.md entries and [commitizen](https://github.com/commitizen/cz-cli) to standardize
commit messages. Pull Request messages should be standardized to commitizen syntax (aka angular standard)
before merge.

Release process:

* Confirm that `master` passes CI tests
* Bump version in `package.json`
* Run `npm run changelog`
* Add updated CHANGELOG.md to master
* Push commits
* npm publish

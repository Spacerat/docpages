# docpages

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]

<!-- [![Build Status][build-img]][build-url] -->
<!-- [![Code Coverage][codecov-img]][codecov-url] -->
<!-- [![Commitizen Friendly][commitizen-img]][commitizen-url] -->
<!-- [![Semantic Release][semantic-release-img]][semantic-release-url]  -->

Docpages finds text inside files like this

```ts
// My file.ts

/*
@doc start

# Welcome to my project!

You're viewing {{doc_name}}

@doc end
*/

function main() {
  ...
}
```

And extracts it out alongside like this:

```md
# Welcome to my project

You're viewing readme.md
```

If the current working directory includes a .gitignore file, those files are ignored by docpages.

## Why Docpages?

README.md files in github are great for documenting high-level things at the module level, such as architecture, code structure. They're simple, live alongside your code, and are wonderfully rendered by github.

Howeer, README files do not live _in_ your code, and anything which does not live _in_ your code is liable to be forgotten about.

Docpages gives you the best of both worlds:

- write your architecture docs in your code so that they're more likely to be updated
- run doc pages, view your docs directly in github

Docpages is _not_ designed for API docs!

## Is this ready?

It is **very early**. I've only used it on this repo so far. It's quite hacky, not fully documented (lol!) and is lacking many features I would like to build (_see also: 'What's missing?'_).

## Install

```bash
npm install -g docpages
```

## CLI usage

Render docs

```
docpages # this directory
docpages . # this directory
docpages src # src directory
```

Note that docpages currently uses your .gitignore file to exclude files.

## Templating

Documentation blocks are processed using the [Squirrely](https://squirrelly.js.org/docs/syntax/filters) templating engine. The variables made available to the templating engine are documented in [src/templates.md](src/templates.md).

[Global templates](./docpages) are also used to build the final output. Run the following command to write out the current version of the default template (which adds no content)

```
docpages --init
```

## What's missing?

- [ ] Better documentation of templating and available helpers
- [ ] Support for an generating 'table of contents'
  - Templates would have access to a list of output files in their descendent folders
- [ ] More helpers for generating links to files
- [ ] More configuration
  - [ ] Custom delimiters
  - [ ] Extensibility mechanism
  - [ ] Configurable ignore mechansim
- [ ] Better optimization
  - model as a tree of directories
  - each directory is a single 'compilation unit'
  - parent directories depend on child directories
  - child directories can be processed in parallel
- [ ] Tests...

[downloads-img]: https://img.shields.io/npm/dt/docpages
[downloads-url]: https://www.npmtrends.com/docpages
[npm-img]: https://img.shields.io/npm/v/docpages
[npm-url]: https://www.npmjs.com/package/docpages
[issues-img]: https://img.shields.io/github/issues/spacerat/docpages
[issues-url]: https://github.com/spacerat/docpages/issues

<!-- [build-img]: https://github.com/spacerat/docpages/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/spacerat/docpages/actions/workflows/release.yml -->
<!-- [codecov-img]: https://codecov.io/gh/spacerat/docpages/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/spacerat/docpages -->
<!-- [semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release -->
<!-- [commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/ -->

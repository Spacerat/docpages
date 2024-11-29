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

## Install

```bash
npm install -g docpages
```

## Usage

```
Usage: docpages [options] [path]

Recurse through all text files (except anything specified by your top-level .gitignore) and extract documentation snippets.

Text between '@doc start' and '@doc end' is extracted and written to an adjacent file - readme.md by default.

The text is processed with the Moustache template engine. The available variables are:

- {{doc_path}}: the path to the generated file
- {{doc_name}}: the name of the generated file
- {{dir_path}}: the path to the directory containing the file
- {{dir_name}}: the name of the directory containing the file
- {{name}}: the name of the file being processed
- {{path}}: the path to the file being processed


Arguments:
  path                     the top directory to scan. (default: ".")

Options:
  -V, --version            output the version number
  --init                   generate a .docpages directory with default templates
  -o, --output <filename>  set the default output file name in each directory
  -h, --help               display help for command
```

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

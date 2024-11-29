# docpages

[![npm package][npm-img]][npm-url]

<!-- [![Build Status][build-img]][build-url] -->

[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]

<!-- [![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url] -->

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

And extracts it out alongside like this

```md
# Welcome to my project

You're viewing readme.md
```

## Install

```bash
npm install -g docpages
```

## Usage

```bash

```

<!-- [build-img]: https://github.com/spacerat/docpages/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/spacerat/docpages/actions/workflows/release.yml -->

[downloads-img]: https://img.shields.io/npm/dt/docpages
[downloads-url]: https://www.npmtrends.com/docpages
[npm-img]: https://img.shields.io/npm/v/docpages
[npm-url]: https://www.npmjs.com/package/docpages
[issues-img]: https://img.shields.io/github/issues/spacerat/docpages
[issues-url]: https://github.com/spacerat/docpages/issues

<!-- [codecov-img]: https://codecov.io/gh/spacerat/docpages/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/spacerat/docpages -->
<!-- [semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release -->
<!-- [commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/ -->

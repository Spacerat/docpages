
# `src` directory


## [cli.ts](/src/cli.ts)

This is the entrypoint, defining the CLI interface and available options.


## [sqrl.ts](/src/sqrl.ts)

This file defines extra functions that the templates can use, such as "lines"

For example:

`{{@lines(38, 48) /}}`

- Quote lines between 38 and 49

```js
Sqrl.helpers.define("lines", function (content, blocks, config) {
  const start: number = ensureInteger(content.params[0]);
  const end: number = ensureInteger(content.params[1]);
  const source = ensureString(config.source ?? "");

  return (
    source
      .split("\n")
      .slice(start - 1, end)
      .join("\n") + "\n"
  );
});
```

`{{@quoteBlock('Sqrl.helpers.define("quoteBlock"', 2) /}}`

- First argument: The string to search for
- Second argument: The occurrence of the string to find

```js
Sqrl.helpers.define("quoteBlock", function (content, blocks, config) {
  const LINES_AFTER_BLOCK = 1; // Eventually make this configurable or a parameter

  const search = ensureString(content.params[0]);
  const lineOccurrence = ensureInteger(content.params[1] ?? 1);
  const source = ensureString(config.source ?? "");
  const lines = source.split("\n");

  const startIndex = findStartIndex(lines, search, lineOccurrence);
  if (startIndex === -1) {
    throw new Error(`Could not find the search string: ${search}`);
  }

  const indentLevel = lines[startIndex].search(/\S|$/);
  const endIndex =
    findEndIndex(lines, startIndex, indentLevel) + LINES_AFTER_BLOCK;

  return lines.slice(startIndex, endIndex).join("\n") + "\n";
});
```


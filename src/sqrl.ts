import * as Sqrl from "squirrelly";

/* @doc start

This file defines extra functions that the templates can use, such as "lines"

For example:

`{{`{{@lines(38, 48) /}}`}}`

- Quote lines between 38 and 49

```js
{{@lines(38, 49) /}}
```

@doc end */

Sqrl.defaultConfig.autoEscape = false;

function ensureInteger(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error(`Expected a number but got ${value}`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`Expected an integer but got ${value}`);
  }
  return value;
}

function ensureString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`Expected a string but got ${value}`);
  }
  return value;
}

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

/* @doc start

`{{`{{@quoteBlock('Sqrl.helpers.define("quoteBlock"', 2) /}}`}}`

- First argument: The string to search for
- Second argument: The occurrence of the string to find

```js
{{@quoteBlock('Sqrl.helpers.define("quoteBlock"', 2) /}}
```

@doc end */

function findStartIndex(lines: string[], search: string, occurrence: number) {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(search)) {
      if (count === occurrence) {
        return i;
      }
      count++;
    }
  }
  return -1;
}

function findEndIndex(
  lines: string[],
  startIndex: number,
  indentLevel: number
) {
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (!!lines[i].trim() && lines[i].search(/\S|$/) <= indentLevel) {
      return i;
    }
  }
  return lines.length;
}

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

export default Sqrl;

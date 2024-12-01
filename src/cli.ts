#!/usr/bin/env node

import { Command } from "commander";

import Mustache from "mustache";

import { createDefaultTemplates } from "./defaultTemplates";
import { generate } from "./generate";

Mustache.escape = (text) => text;

/*
@doc start

This is the entrypoint, defining the CLI interface and available options.

@doc end */

const packageJson = require("../package.json");
const version: string = packageJson.version;

const program = new Command();

program.version(version);

program
  .name("docpages")
  .description(
    `Recurse through all text files (except anything specified by your top-level .gitignore) and extract documentation snippets.
    
Text between '@doc start' and '@doc end' is extracted and written to an adjacent file - readme.md by default.

The text is processed with the Squirrely template engine. The available variables are:

- {{doc_path}}: the path to the generated file
- {{doc_name}}: the name of the generated file
- {{dir_path}}: the path to the directory containing the file
- {{dir_name}}: the name of the directory containing the file
- {{name}}: the name of the file being processed
- {{path}}: the path to the file being processed
`
  )
  .argument("[path]", "the top directory to scan.", ".")
  .option("--init", "generate a .docpages directory with default templates")
  .option(
    "-o, --output <filename>",
    "set the default output file name in each directory"
  )
  .action((path, options) => {
    if (options.init) {
      createDefaultTemplates().catch((e) => {
        console.error(e);
        process.exit(1);
      });
    } else {
      generate(path, { defaultName: options.output }).catch((e) => {
        console.error(e);
        process.exit(1);
      });
    }
  });

program.parse();

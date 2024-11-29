#!/usr/bin/env node

import { Command } from "commander";
import { glob } from "glob-gitignore";
import { promises as fs } from "fs";
import paths from "path";

import Mustache from "mustache";

import { groupBy, readIfExists, writeIfNotExists } from "./utils";

Mustache.escape = (text) => text;

/* @doc start

This is the main source file.

It implements a full CLI inteface using Commander and Mustache templates.

@doc end */

const packageJson = require("../package.json");
const version: string = packageJson.version;

const defaultDirTemplate = `
{{! This template is applied to each output file }}
{{#files}}
{{file}}
{{/files}}
`.trim();

const defaultFileTemplate = `
{{! This template is applied to each input file }}
{{> content}}
`.trim();

async function findFiles(path: string) {
  const gitignore = await fs.readFile(".gitignore", "utf8");

  const rules = gitignore.split("\n");

  return await glob(paths.join(path, "**"), { ignore: rules });
}

function getConfigPaths() {
  const docpagesDir = paths.join(process.cwd(), ".docpages");

  const dirTemplatePath = paths.join(docpagesDir, "doc.mustache");
  const fileTemplatePath = paths.join(docpagesDir, "source.mustache");

  return { dirTemplatePath, fileTemplatePath, docpagesDir };
}

async function generate(
  path: string,
  { defaultName = "README.md" }: { defaultName?: string } = {}
) {
  // read the local gitignore file

  const allFiles = await findFiles(path);

  const grouped = groupBy(allFiles, (file) => paths.dirname(file));

  const { dirTemplatePath, fileTemplatePath } = getConfigPaths();
  const [dirTemplate, fileTemplate] = await Promise.all([
    readIfExists(dirTemplatePath, defaultDirTemplate),
    readIfExists(fileTemplatePath, defaultFileTemplate),
  ]);

  await Promise.all(
    Object.entries(grouped).map(async ([dir, files]) => {
      const allTemplates = (
        await Promise.all(
          files.map(async (file) => {
            // ignore if directory
            if ((await fs.stat(file)).isDirectory()) {
              return [];
            }

            // read the file
            const content = await fs.readFile(file, "utf8");

            // Extract all markdown snippets between any @doc start and @md end which start a line
            const results = content.matchAll(
              /(?:^([/*# ])*@doc start((?:[^\S\r\n]+)(?<filename>[\w/.]+))?)(?<template>[\s\S]*?)(?:^([/*# ])*@doc end)/gm
            );

            return (
              Array.from(results)
                .map((result) => result.groups)
                .filter((groups) => groups != null)
                .map((groups) => {
                  const { filename, template } = groups;
                  const docpath = paths.join(dir, filename || defaultName);

                  return {
                    filepath: file,
                    template: template.trim(),
                    docpath,
                  };
                })
                // Prevent a file from writing to itself
                .filter(
                  (result) =>
                    result.filepath.toLocaleLowerCase() !==
                    result.docpath.toLocaleLowerCase()
                )
            );
          })
        )
      ).flat();

      const byFile = groupBy(allTemplates.flat(), (item) => item.docpath);

      await Promise.all(
        Object.entries(byFile).map(async ([docspath, templates]) => {
          console.log(`Writing ${docspath}`);

          const directoryVars = {
            doc_path: docspath,
            dir_path: dir,
            doc_name: paths.basename(docspath),
            dir_name: paths.basename(dir),
          };

          const files = templates.map((template) => {
            const fileVars = {
              path: template.filepath,
              name: paths.basename(template.filepath),
            };

            const fileRendered = Mustache.render(
              fileTemplate,
              {
                ...directoryVars,
                ...fileVars,
              },
              { content: template.template }
            );
            return { ...fileVars, file: fileRendered };
          });

          const result = Mustache.render(dirTemplate, {
            ...directoryVars,
            files,
          });

          await fs.writeFile(docspath, result);
        })
      );
    })
  );
}

async function init() {
  const { dirTemplatePath, fileTemplatePath, docpagesDir } = getConfigPaths();

  // Ensure the .docpages directory exists
  await fs.mkdir(docpagesDir, { recursive: true });

  await writeIfNotExists(dirTemplatePath, defaultDirTemplate);
  await writeIfNotExists(fileTemplatePath, defaultFileTemplate);
}

const program = new Command();

program.version(version);

program
  .name("docpages")
  .description(
    `Recurse through all text files (except anything specified by your top-level .gitignore) and extract documentation snippets.
    
Text between '@doc start' and '@doc end' is extracted and written to an adjacent file - readme.md by default.

The text is processed with the Moustache template engine. The available variables are:

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
      init().catch((e) => {
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

import { Command } from 'commander';
import { glob } from 'glob-gitignore';
import { promises as fs } from 'fs';
import paths from 'path';

import Mustache from 'mustache';

Mustache.escape = text => text;

/* @doc start

This is the main source file.

It implements a full CLI inteface using Commander and Mustache templates.

@doc end */

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

const defaultDirTemplate = `
{{#files}}
  {{file}}
{{/files}}
`;

const defaultFileTemplate = `
{{> content}}
`;

async function findFiles(path: string) {
  const gitignore = await fs.readFile('.gitignore', 'utf8');

  const rules = gitignore.split('\n');

  return await glob(paths.join(path, '**'), { ignore: rules });
}

function getConfigPaths() {
  const docpagesDir = paths.join(process.cwd(), '.docpages');

  const dirTemplatePath = paths.join(docpagesDir, 'directory.mustache');
  const fileTemplatePath = paths.join(docpagesDir, 'file.mustache');

  return { dirTemplatePath, fileTemplatePath, docpagesDir };
}

async function readIfExists(path: string, defaultValue: string) {
  try {
    await fs.access(path);
    return await fs.readFile(path, 'utf8');
  } catch {
    return defaultValue;
  }
}

async function generate(path: string) {
  // read the local gitignore file

  const allFiles = await findFiles(path);

  const grouped = groupBy(allFiles, file => paths.dirname(file));

  const { dirTemplatePath, fileTemplatePath } = getConfigPaths();
  const [dirTemplate, fileTemplate] = await Promise.all([
    readIfExists(dirTemplatePath, defaultDirTemplate),
    readIfExists(fileTemplatePath, defaultFileTemplate),
  ]);

  await Promise.all(
    Object.entries(grouped).map(async ([dir, files]) => {
      const allTemplates = (
        await Promise.all(
          files.map(async file => {
            // ignore if directory
            if ((await fs.stat(file)).isDirectory()) {
              return [];
            }

            // read the file
            const content = await fs.readFile(file, 'utf8');

            // Extract all markdown snippets between any @doc start and @md end which start a line
            const results = content.matchAll(
              /(?:^([/*# ])*@doc start((?:[^\S\r\n]+)(?<filename>[\w/.]+))?)(?<template>[\s\S]*?)(?:^([/*# ])*@doc end)/gm
            );

            return Array.from(results).map(result => {
              const { filename, template } = result.groups!;
              const docpath = paths.join(dir, filename || 'readme.md');

              return {
                filename: file,
                template: template.trim(),
                docpath,
              };
            });
          })
        )
      ).flat();

      const byFile = groupBy(allTemplates.flat(), item => item.docpath);

      await Promise.all(
        Object.entries(byFile).map(async ([docspath, templates]) => {
          console.log(`Writing ${docspath}`);

          const directoryVars = {
            doc_path: docspath,
            dir_path: dir,
            doc_name: paths.basename(docspath),
            dir_name: paths.basename(dir),
          };

          const files = templates.map(template => {
            const fileVars = {
              path: template.filename,
              name: paths.basename(template.filename),
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

program.version(version);

program
  .command('generate')
  .argument(
    '[path]',
    'Recurse this path to find files to extract documentation from. Defaults to the current path',
    '.'
  )
  .action(path => {
    generate(path).catch(e => {
      console.error(e);
      process.exit(1);
    });
  });

program.command('init').action(async () => {
  const { dirTemplatePath, fileTemplatePath, docpagesDir } = getConfigPaths();

  // Ensure the .docpages directory exists
  await fs.mkdir(docpagesDir, { recursive: true });

  // Write defaultDirTemplate to .docpages/directory.mustache if it doesn't exist
  try {
    await fs.access(dirTemplatePath);
  } catch {
    await fs.writeFile(dirTemplatePath, defaultDirTemplate);
  }

  // Write defaultFileTemplate to .docpages/file.mustache if it doesn't exist
  try {
    await fs.access(fileTemplatePath);
  } catch {
    await fs.writeFile(fileTemplatePath, defaultFileTemplate);
  }

  console.log('Initialized .docpages templates');
});

program.parse();

const groupBy = <T, K extends string>(list: T[], getKey: (item: T) => K) =>
  list.reduce(
    (previous, currentItem) => {
      const group = getKey(currentItem);
      if (!previous[group]) previous[group] = [];
      previous[group].push(currentItem);
      return previous;
    },
    {} as Record<K, T[]>
  );

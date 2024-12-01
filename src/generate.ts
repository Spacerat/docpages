import Mustache from "mustache";
import { promises as fs } from "fs";
import paths from "path";
import { readDefaultTemplates } from "./defaultTemplates";
import { groupBy } from "./utils";
import { glob } from "glob-gitignore";

type Opts = { defaultName?: string };

export async function generate(
  path: string,
  { defaultName = "README.md" }: Opts = {}
) {
  const allFiles = await findFiles(path);

  const grouped = groupBy(allFiles, (file) => paths.dirname(file));

  const { dirTemplate, fileTemplate } = await readDefaultTemplates();

  await Promise.all(
    Object.entries(grouped).map(async ([dir, files]) => {
      const allTemplates = (
        await Promise.all(
          files.map(async (file) => {
            // ignore if directory
            if ((await fs.stat(file)).isDirectory()) {
              return [];
            }

            const content = await fs.readFile(file, "utf8");

            // Extract all markdown snippets between any '@doc start' and '@doc end' which start a line
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

export async function findFiles(path: string) {
  const gitignore = await fs.readFile(".gitignore", "utf8");

  const rules = gitignore.split("\n");

  return await glob(paths.join(path, "**"), { ignore: rules });
}

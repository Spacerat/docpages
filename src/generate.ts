import Sqrl from "./sqrl";
import { promises as fs } from "fs";
import paths from "path";
import { readDefaultTemplates } from "./defaultTemplates";
import { groupBy } from "./utils";
import { glob } from "glob-gitignore";
import dedent from "dedent";

type Opts = { defaultName?: string };

export async function generate(
  path: string,
  { defaultName = "README.md" }: Opts = {}
) {
  const allFiles = await findFiles(path);

  const grouped = groupBy(allFiles, (file) => paths.dirname(file));

  const { dirTemplate, fileTemplate } = await readDefaultTemplates();

  await Promise.all(
    Object.entries(grouped).map(async ([outputDirectoryPath, files]) => {
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
                  const docpath = paths.join(
                    outputDirectoryPath,
                    filename || defaultName
                  );

                  return {
                    filepath: file,
                    template: template,
                    filesource: content,
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
        Object.entries(byFile).map(async ([outputPath, templates]) => {
          console.log(`Writing ${outputPath}`);

          /* @doc start templates.md
          These variables are defined for each output file, and are also available in doc.sqrl

            - {{`{{it.doc_path}}`}}: the path to the generated file e.g. "{{it.doc_path}}"
            - {{`{{it.doc_name}}`}}: the name of the generated file e.g. "{{it.doc_name}}"
            - {{`{{it.dir_path}}`}}: the path to the directory containing the file e.g. "{{it.dir_path}}"
            - {{`{{it.dir_name}}`}}: the name of the directory containing the file e.g. "{{it.dir_name}}"
          @doc end */

          const directoryVars = {
            doc_path: outputPath,
            doc_name: paths.basename(outputPath),
            dir_path: outputDirectoryPath,
            dir_name: paths.basename(outputDirectoryPath),
          };

          const bySourceFile = groupBy(templates, (item) => item.filepath);

          const files = Object.values(bySourceFile).map((templates) => {
            /* @doc start templates.md
            These variables are only available within @doc blocks in source files

              - {{`{{it.path}}`}}: the path to the file being processed e.g. "{{it.path}}"
              - {{`{{it.name}}`}}: the name of the file being processed e.g. "{{it.name}}"
            @doc end */
            const fileVars = {
              path: templates[0].filepath,
              name: paths.basename(templates[0].filepath),
            };

            const fileContext = {
              ...directoryVars,
              ...fileVars,
            };

            const renderedBlocks = templates.map((template) =>
              Sqrl.render(dedent(template.template), fileContext, {
                source: template.filesource,
              })
            );

            return {
              content: Sqrl.render(fileTemplate, {
                ...fileContext,
                content: renderedBlocks.join("\n\n"),
              }),
            };
          });

          const result = Sqrl.render(dirTemplate, {
            ...directoryVars,
            files,
          });

          await fs.writeFile(outputPath, result);
        })
      );
    })
  );
}

export async function findFiles(path: string) {
  const gitignore = await fs.readFile(".gitignore", "utf8");

  const rules = [...gitignore.split("\n"), ".git"];

  return await glob(paths.join(path, "**"), { ignore: rules, dot: true });
}

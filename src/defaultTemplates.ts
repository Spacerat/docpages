import paths from "path";
import { promises as fs } from "fs";

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

function getDefaultTemplatePaths() {
  const docpagesDir = paths.join(process.cwd(), ".docpages");

  const dirTemplatePath = paths.join(docpagesDir, "doc.mustache");
  const fileTemplatePath = paths.join(docpagesDir, "source.mustache");

  return { dirTemplatePath, fileTemplatePath, docpagesDir };
}

async function readIfExists(path: string, defaultValue: string) {
  try {
    await fs.access(path);
    return await fs.readFile(path, "utf8");
  } catch {
    return defaultValue;
  }
}

async function writeIfNotExists(path: string, content: string) {
  // Write defaultDirTemplate to .docpages/directory.mustache if it doesn't exist
  try {
    await fs.writeFile(path, content, { flag: "wx" });
    console.log(`Wrote ${path}`);
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code !== "EEXIST") {
      throw e;
    }
    console.log(`Not overwriting ${path} which already exists`);
  }
}

export async function createDefaultTemplates() {
  const { dirTemplatePath, fileTemplatePath, docpagesDir } =
    getDefaultTemplatePaths();

  // Ensure the .docpages directory exists
  await fs.mkdir(docpagesDir, { recursive: true });

  await Promise.all([
    writeIfNotExists(dirTemplatePath, defaultDirTemplate),
    writeIfNotExists(fileTemplatePath, defaultFileTemplate),
  ]);
}

export async function readDefaultTemplates() {
  const { dirTemplatePath, fileTemplatePath } = getDefaultTemplatePaths();
  const [dirTemplate, fileTemplate] = await Promise.all([
    readIfExists(dirTemplatePath, defaultDirTemplate),
    readIfExists(fileTemplatePath, defaultFileTemplate),
  ]);
  return { dirTemplate, fileTemplate };
}

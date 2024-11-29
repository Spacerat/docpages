import { promises as fs } from "fs";

export const groupBy = <T, K extends string>(
  list: T[],
  getKey: (item: T) => K
) =>
  list.reduce(
    (previous, currentItem) => {
      const group = getKey(currentItem);
      if (!previous[group]) previous[group] = [];
      previous[group].push(currentItem);
      return previous;
    },
    {} as Record<K, T[]>
  );

export async function readIfExists(path: string, defaultValue: string) {
  try {
    await fs.access(path);
    return await fs.readFile(path, "utf8");
  } catch {
    return defaultValue;
  }
}

export async function writeIfNotExists(path: string, content: string) {
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

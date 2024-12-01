declare module "glob-gitignore" {
  export function glob(
    pattern: string,
    options?: { ignore: string[]; dot?: boolean }
  ): Promise<string[]>;
}

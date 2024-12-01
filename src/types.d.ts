/* @doc start

We use glob-gitignore to handle ignoring all files ignored by gitignore.

This file is necessary since it does not have typescript types.

@doc end */

declare module "glob-gitignore" {
  export function glob(
    pattern: string,
    options?: { ignore: string[]; dot?: boolean }
  ): Promise<string[]>;
}

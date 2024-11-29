/* @doc start

We use glob-gitignore to handle ignoring all files ignored by gitignore.

This file is necessary since it does not have typescript types.

@doc end */

declare module 'glob-gitignore' {
  import { type GlobOptions } from 'fs';
  export function glob(
    pattern: string,
    options?: GlobOptions & { ignore: string[] }
  ): Promise<string[]>;
}

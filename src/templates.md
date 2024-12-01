
# `src` directory


## [generate.ts](/src/generate.ts)

These variables are defined for each output file, and are also available in doc.sqrl

  - {{it.doc_path}}: the path to the generated file e.g. "src/templates.md"
  - {{it.doc_name}}: the name of the generated file e.g. "templates.md"
  - {{it.dir_path}}: the path to the directory containing the file e.g. "src"
  - {{it.dir_name}}: the name of the directory containing the file e.g. "src"

These variables are only available within @doc blocks in source files

  - {{it.path}}: the path to the file being processed e.g. "src/generate.ts"
  - {{it.name}}: the name of the file being processed e.g. "generate.ts"


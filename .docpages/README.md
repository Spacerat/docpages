
# `.docpages` directory


## [doc.sqrl](/.docpages/doc.sqrl)

The doc.sqrl file in the .docpages directory defines a template which is applied to each output file.

Each output file consists of the content of the `@doc` blocks in one or more files.


## [source.sqrl](/.docpages/source.sqrl)

The source.sqrl file in the .docpages directory defines a template which is applied to the content of each source file.

Each file may define multiple blocks. The blocks are rendered and concatenated, then rendered into this template with `{{it.content}}`.


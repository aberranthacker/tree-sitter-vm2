# tree-sitter-vm2
PDP-11 family assembly grammar for tree-sitter.

It support syntax and features of GNU Assmebler.
The main target is [K1801VM2](https://en.wikipedia.org/wiki/1801_series_CPU#K1801VM2) microprocessor, which in turn has the the same
instructions set as PDP-11 with EIS and FIS extensions.

## Install

### NeoVim
[Adding parsers](https://github.com/nvim-treesitter/nvim-treesitter?tab=readme-ov-file#adding-parsers)

## TODO
    - fix support for `.dc.[size]`/`.ds.[size]` directives
    - add support for macro interpolations


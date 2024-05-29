# tree-sitter-vm2
PDP-11 family assembly grammar for tree-sitter.

It supports the syntax and features of the GNU Assembler.
The main target is [K1801VM2](https://en.wikipedia.org/wiki/1801_series_CPU#K1801VM2) microprocessor, which in turn has the the same
instructions set as the PDP-11 with EIS and FIS extensions.

## Install

### NeoVim
[Adding parsers](https://github.com/nvim-treesitter/nvim-treesitter?tab=readme-ov-file#adding-parsers)

Add to you tree-sitter config:
```lua
      local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
      parser_config.vm2 = {
        install_info = {
          url = 'git@github.com:aberranthacker/tree-sitter-vm2.git', -- local path or git repo
          files = { 'src/parser.c' },
          -- optional entries:
          generate_requires_npm = false, -- if stand-alone parser without npm dependencies
          requires_generate_from_grammar = false, -- if folder contains pre-generated src/parser.c
        },
        -- filetype = 'gas', -- if filetype does not match the parser name
      }
```

## TODO
- fix support for `.dc.[size]`/`.ds.[size]` directives
- implement parsing of `.irp` and `.irpc` directives
- implement parsing of `.ifc` and `.ifnc`, they take unquoted strings as arguments
- implement parsing of macro interpolations

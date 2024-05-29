; https://github.com/nvim-treesitter/nvim-treesitter/blob/ea2b137f35fb1e87a6471ec311805920fdf45745/CONTRIBUTING.md
(symbol) @type
(location_counter) @variable.parameter.builtin
(label name: (symbol) @type)
(local_label) @type

(instruction_mnemonic) @keyword

(include (directive_mnemonic) @include)
(include_bin (directive_mnemonic) @include)
(directive_mnemonic) @keyword.directive

(title heading: (string_literal) @text.title)
; (size) @attribute

(control_mnemonic) @constructor
; (conditional (control_mnemonic) @conditional)
(macro_definition name: (symbol) @function.macro)
(macro_call name: (symbol) @text.reference)
;(macro_arg) @variable.builtin
; (interpolated (macro_arg) @embedded)

(repeat (control_mnemonic) @keyword.repeat)

(path) @string.special.path
(char_literal) @character
(string_literal) @string
(string_escape_code) @string.escape

[
  (decimal_literal)
  (hexadecimal_literal)
  (octal_literal)
] @number

(float_decimal_literal) @float
(binary_literal) @boolean

[
  (register)
  (named_register)
] @keyword

[
  (operator)
  "="
  "#"
  "@"
] @operator

[
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "-("
  ")+"
] @punctuation.bracket

; (section) @namespace
(comment) @comment

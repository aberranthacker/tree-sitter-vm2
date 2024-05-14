(symbol) @type
(location_counter) @type
(label name: (symbol) @type)
(local_label) @type

(instruction_mnemonic) @keyword

(include (directive_mnemonic) @include)
(include_bin (directive_mnemonic) @include)
(directive_mnemonic) @preproc

(title heading: (string_literal) @text.title)
; (size) @attribute

(control_mnemonic) @constructor
; (conditional (control_mnemonic) @conditional)
(macro_definition name: (symbol) @function.macro)
(macro_call name: (symbol) @text.reference)
(macro_arg) @variable.builtin
; (interpolated (macro_arg) @embedded)

(repeat (control_mnemonic) @repeat)

[
  (path)
  (char_literal)
  (string_literal)
] @string
(string_escape_code) @character.special

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

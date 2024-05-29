const binaryOperators = [ // {{{
  "||",
  "&&",
  choice("==", "!=", "<>"),
  choice("<", ">", ">=", "<="),
  choice("+", "-"),
  choice("*", "/", "%", "//"),
  choice("|", "!"),
  choice("^", "~"),
  "&",
  choice("<<", ">>"),
]; // }}}
const unaryPrec = binaryOperators.length + 1;
const instructions = [ // {{{
  // single operand
  "clr",
  "clrb",
  "com",
  "comb",
  "inc",
  "incb",
  "dec",
  "decb",
  "neg",
  "negb",
  "tst",
  "tstb",
  "asr",
  "asrb",
  "asl",
  "aslb",
  "ror",
  "rorb",
  "rol",
  "rolb",
  "ror",
  "rorb",
  "swab",
  "adc",
  "adcb",
  "sbc",
  "sbcb",
  "sxt",
  "mfps",
  "mtps",
  // double operand
  "mov",
  "movb",
  "cmp",
  "cmpb",
  "add",
  "sub",
  "bit",
  "bitb",
  "bic",
  "bicb",
  "bis",
  "bisb",
  "mul",
  "div",
  "ash",
  "ashc",
  "xor",
  // program control
  "br",
  "bne",
  "bnz",
  "beq",
  "bze",
  "bpl",
  "bmi",
  "bvc",
  "bvs",
  "bcc",
  "bcs",
  "bge",
  "blt",
  "bgt",
  "ble",
  "bhi",
  "blos",
  "bhis",
  "blo",
  "jmp",
  "jsr",
  "call",
  "rts",
  "mark",
  "sob",
  "emt",
  "trap",
  "fadd",
  "fsub",
  "fmul",
  "fdiv",
]; // }}}
const instructionsNoOperands = [ // {{{
  "return",
  "halt",
  "wait",
  "nop",
  "rti",
  "bpt",
  "iot",
  "reset",
  "rtt",
  "clc",
  "clv",
  "clz",
  "cln",
  "ccc",
  "sec",
  "sev",
  "sez",
  "sen",
  "scc",
]; // }}}
const directives = [ // {{{
  ".align",   // .align [abs-expr[, abs-expr[, abs-expr]]]
  ".ascii",
  ".asciz",
  ".balingn", // .balign[wl] [abs-expr[, abs-expr[, abs-expr]]]
  ".error",
  ".print",   // .print string
  ".warning",
  ".org",
  ".global",  // .global symbol, .globl symbol
]; // }}}
const directiveNoOperands = [ // {{{
  ".even",
  ".list",
  ".nolist",
  ".eject",
  ".err",
  ".ident",
]; // }}}
const sectionTypes = [ // {{{
  ".text",
  ".data",
  ".bss",
  ".subsection",
  ".pushsection",
  ".popsection",
  ".previous",
]; // }}}
const conditionalExp = [ // {{{
  ".if",
  ".ifb",
  ".ifeq",
  ".ifge",
  ".ifgt",
  ".ifle",
  ".iflt",
  ".ifnb",
  ".ifne",
]; // }}}
const conditionalComp = [".ifc", ".ifnc", ".ifeqs", ".ifneqs"];
const conditionalSymbol = [".ifdef", ".ifndef", ".ifnotdef"];

const registerNames = ["sp", "pc"];

module.exports = grammar({
  name: "vm2",
  extras: ($) => [" ", "\t", "\r", $.comment,],

  rules: {
    source_file: ($) => repeat($._line),

    _line: ($) => prec.right(
      choice(
        seq($._element, "\n"),
        "\n",
        $._element,
      ),
    ),

    elements: ($) => prec.right(repeat1($._block_line)),
    _block_line: ($) =>
      choice(
        $._element, "\n",
        "\n",
      ),

    _element: ($) =>
      choice(
        $._definition,
        $._statement,
        $._standalone_label,
        $._block,
      ),

    _definition: ($) =>
      choice(
        $.symbol_definition,
        $.symbol_assignment,
        $.macro_definition,
      ),

    _statement: ($) =>
      seq(
        optional(prec(-1, repeat1($.label))),
        choice(
          $.instruction,
          $.directive,
          //$.section,
          $.data_constant,
          $.data_space,
          $.include,
          $.include_bin,
          $.title,
          //$.external_definition,
          $.macro_call,
        ),
      ),

    _block: ($) => choice(
      $.repeat,
      $.conditional,
      //$.end,
    ),

    _standalone_label: ($) => prec(-1, repeat1($.label)),

    //----------------------------------------------------------------------
    // Labels:
    //----------------------------------------------------------------------
    label: ($) => seq(field("name", $._identifier), ":"),

    //----------------------------------------------------------------------
    // Comments:
    //----------------------------------------------------------------------
    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: (_) => token(
      choice(
        seq(";", /[^\r\n]*/),
        seq(
          '/*',
          /[^*]*\*+([^/*][^*]*\*+)*/,
          '/',
        ),
      ),
    ),

    //----------------------------------------------------------------------
    // Mnemonics:
    //----------------------------------------------------------------------

    // instructions:
    _instruction_mnemonic_op: ($) =>
      alias(mnemonicChoice(instructions), $.instruction_mnemonic),
    _instruction_mnemonic_noop: ($) =>
      alias(mnemonicChoice(instructionsNoOperands), $.instruction_mnemonic),

    // directives:

    _data_constant_mnemonic: ($) => alias(caseInsensitive(".dc"), $.directive_mnemonic),
    _data_constant_short_mnemonic: ($) => alias(mnemonicChoice([".byte", ".word"]), $.directive_mnemonic),
    _data_space_mnemonic: ($) =>
      alias(caseInsensitive(".ds"), $.directive_mnemonic),
    _data_space_short_mnemonic: ($) =>
      alias(mnemonicChoice([".dcb", ".space", ".skip"]), $.directive_mnemonic),

    _symbol_definition_mnemonic: ($) =>
      alias(mnemonicChoice(['.equiv', '.eqv']), $.directive_mnemonic),
    _symbol_assignment_mnemonic: ($) =>
      alias(mnemonicChoice([".equ", ".set"]), $.directive_mnemonic),

    _directive_mnemonic_noop: ($) =>
      alias(mnemonicChoice(directiveNoOperands), $.directive_mnemonic),
    _directive_mnemonic_op: ($) =>
      alias(mnemonicChoice(directives), $.directive_mnemonic),

    _incbin_mnemonic:  ($) => alias(caseInsensitive(".incbin"), $.directive_mnemonic),
    _include_mnemonic: ($) => alias(caseInsensitive(".include"), $.directive_mnemonic),
    _title_mnemonic:   ($) => alias(caseInsensitive(".title"), $.directive_mnemonic),

    _conditional_mnemonic_exp:    ($) => alias(mnemonicChoice(conditionalExp), $.control_mnemonic),
    _conditional_mnemonic_comp:   ($) => alias(mnemonicChoice(conditionalComp), $.control_mnemonic),
    _conditional_mnemonic_symbol: ($) => alias(mnemonicChoice(conditionalSymbol), $.control_mnemonic),
    _else_mnemonic:  ($) => alias(mnemonicChoice([".else", ".elseif"]), $.control_mnemonic),
    _endif_mnemonic: ($) => alias(caseInsensitive(".endif"), $.control_mnemonic),

    _irp_mnemonic:  ($) => alias(caseInsensitive(".irp"), $.control_mnemonic),
    _irpc_mnemonic: ($) => alias(caseInsensitive(".irpc"), $.control_mnemonic),
    _rept_mnemonic: ($) => alias(caseInsensitive(".rept"), $.control_mnemonic),
    _endr_mnemonic: ($) => alias(caseInsensitive(".endr"), $.control_mnemonic),

    // control:
    _macro_mnemonic: ($) => alias(caseInsensitive(".macro"), $.control_mnemonic),
    _endm_mnemonic:  ($) => alias(caseInsensitive(".endm"), $.control_mnemonic),

    // Instruction:

    instruction: ($) =>
      choice(
        // Instruction with operands
        seq(
          field("mnemonic", $._instruction_mnemonic_op),
          field("operands", $.operand_list),
        ),
        // Instruction with no operands
        field("mnemonic", $._instruction_mnemonic_noop),
      ),

    operand_list: ($) => seq(optional(seq($._operand, ",")), $._operand),

    //-------------------------------------------------------------------------
    // Directives:
    //-------------------------------------------------------------------------
    directive: ($) =>
      prec.right(
        choice(
          seq(
            field("mnemonic", $._directive_mnemonic_noop),
          ),
          seq(
            field("mnemonic", $._directive_mnemonic_op),
            field("operands", $.expressions),
          ),
        ),
      ),

    data_constant: ($) => prec.right(2,
      seq(
        choice(
          seq(
            field("mnemonic", $._data_constant_mnemonic),
            optional(field("size", $.dc_size)),
          ),
          field("mnemonic", $._data_constant_short_mnemonic),
        ),
        optional(field("values", $.expressions)),
      ),
    ),

    data_space: ($) => prec.right(2,
      seq(
        choice(
          seq(
            field("mnemonic", $._data_space_mnemonic),
            optional(field("size", $.ds_size)),
          ),
          field("mnemonic", $._data_space_short_mnemonic),
        ),
        field("number", $._expression),
        optional(seq(",", field("fill", $._expression))),
      ),
    ),

    dc_size: (_) => token.immediate(seq(".", /[abdlswxABDLSWX]/)),
    ds_size: (_) => token.immediate(seq(".", /[bdlpswxBDLPSWX]/)),

    include: ($) => seq($._include_mnemonic, field("path", $.path)),

    include_bin: ($) =>
      seq(
        $._incbin_mnemonic,
        field("path", $.path),
        optional(
          seq(
            ",",
            field("offset", $._expression),
            optional(seq(",", field("length", $._expression))),
          ),
        ),
      ),

    path: ($) => choice(/[^"'\s]+/, $.string_literal),

    title: ($) => seq($._title_mnemonic, field("heading", $.string_literal)),

    // Macro call:

    macro_call: ($) =>
      prec.right(-1,
        seq(
          field("name", $._identifier),
          optional(field("operands", $.arguments_list)),
        ),
      ),
    arguments_list: ($) => seq(repeat(seq($._operand, ",")), $._operand),

    //-------------------------------------------------------------------------
    // Block / multiline:
    //-------------------------------------------------------------------------
    repeat: ($) => choice(
      seq(
        $._irp_mnemonic,
        $.symbol,
        optional(seq(",", field("values", $.expressions))),
        "\n",
        optional(field("body", $.elements)),
        $._endr_mnemonic,
      ),
      seq(
        $._irpc_mnemonic,
        $.symbol,
        optional(field("values", $._symbol_chars)),
        "\n",
        optional(field("body", $.elements)),
        $._endr_mnemonic,
      ),
      seq(
        $._rept_mnemonic,
        field("count", $._expression),
        "\n",
        optional(field("body", $.elements)),
        $._endr_mnemonic,
      ),
    ),

    expressions: ($) => seq(repeat(seq($._expression, ",")), $._expression),

    conditional: ($) =>
      seq(
        $._conditional_block_start,
        optional(
          seq(
            field("consequent", $.elements),
            repeat(
              seq(
                $._conditional_block_else,
                field("alternate", $.elements),
              ),
            ),
          ),
        ),
        $._conditional_block_end,
      ),

    _conditional_block_else: ($) => prec.dynamic(1,
      seq($._else_mnemonic, "\n"),
    ),

    _conditional_block_start: ($) =>
      seq(
        choice(
          $._conditional_expression,
          $._conditional_comparison,
          $._conditional_symbol,
        ),
        "\n",
      ),

    _conditional_block_end: ($) => $._endif_mnemonic,

    _conditional_expression: ($) =>
      seq(
        field("mnemonic", $._conditional_mnemonic_exp),
        field("test", $._expression),
      ),

    _conditional_comparison: ($) =>
      seq(
        field("mnemonic", $._conditional_mnemonic_comp),
        field("left", $._expression),
        ",",
        field("right", $._expression),
        optional(","),
      ),

    _conditional_symbol: ($) =>
      seq(
        field("mnemonic", $._conditional_mnemonic_symbol),
        field("test", $._identifier),
      ),

    //----------------------------------------------------------------------
    // Definitions
    //----------------------------------------------------------------------

    symbol_definition: ($) =>
      seq(
        $._symbol_definition_mnemonic,
        $.symbol,
        ",",
        field("value", $._expression),
      ),

    symbol_assignment: ($) =>
      seq(
        choice(
          seq(
            $.symbol,
            "=",
          ),
          seq(
            $._symbol_assignment_mnemonic,
            $.symbol,
            ",",
          ),
        ),
        field("value", $._expression),
      ),

    macro_definition: ($) => prec.right(
      seq(
        $._macro_mnemonic,
        field("name", $.symbol),
        optional($.macro_arguments),
        "\n",
        optional(field("body", $.elements)),
        $._endm_mnemonic,
      )),

    macro_arguments: ($) =>
      seq(
        choice(
          $._macarg_vararg,
          seq(
            $._macargs,
            repeat(
              seq(",", $._macargs)
            ),
            optional(seq(",", $._macarg_vararg)),
          ),
        ),
      ),

    _macargs: ($) => seq(
      choice(
        $._macarg,
        $._macarg_req,
        $._macarg_default,
      )
    ),

    _macarg: ($) => field("macarg", $.symbol),
    _macarg_req: ($) => seq(field("macarg_req", $.symbol), ":req"),
    _macarg_default: ($) => seq(
      field("macarg", $.symbol),
      "=",
      field("default_value", $._expression)
    ),
    _macarg_vararg: ($) => seq(field("macarg_vararg", $.symbol), ":vararg"),

    //----------------------------------------------------------------------
    // Effective addresses:
    //----------------------------------------------------------------------
    _operand: ($) =>
      choice(
        $._register,
        $.indirect_address,
        $.address_postinc,
        $.indirect_address_postinc,
        $.address_predec,
        $.indirect_address_predec,
        $.idx_address,
        $.indirect_idx_address,

        $.immediate_value,
        $.absolute_value,
        $.relative_value,
        $.indirect_relative_value,
      ),

    register: () => /[rR][0-7]/,
    named_register: () => choice(...registerNames.map(caseInsensitive)),
    _register: ($) => choice($.named_register, $.register),

    // General Register Addressing
    // Mode 0: Register                OPR R
    _register: ($) => choice($.named_register, $.register),
    // Mode 1: Register deferred       OPR (R)
    indirect_address: ($) => choice(seq("(", $._register, ")"), seq("@", $._register)),
    // Mode 2: Auto-increment          OPR (R)+
    address_postinc: ($) => seq("(", $._register, ")+"),
    // Mode 3: Auto-increment deferred OPR @(R)+
    indirect_address_postinc: ($) => seq(choice("@", "*"), "(", $._register, ")+"),
    // Mode 4: Auto-decrement          OPR -(R)
    address_predec: ($) => seq("-(", $._register, ")"),
    // Mode 5: Auto-decrement deferred OPR @-(R)
    indirect_address_predec: ($) => seq(choice("@", "*"), "-", "(", $._register, ")"),
    // Mode 6: Index                   OPR X(R)
    idx_address: ($) =>
      seq(
        field("offset", $._expression),
        "(",
        $._register,
        ")",
      ),
    // Mode 7: Index deferred          OPR @X(R)
    indirect_idx_address: ($) =>
      seq(
        choice("@", "*"),
        field("offset", $._expression),
        "(",
        $._register,
        ")",
      ),

    // Program Counter Addressing
    // Mode 2: Immediate          OPR #n
    immediate_value: ($) => seq(choice("#", "$"), field("value", $._expression)),
    // Mode 3: Absolute           OPR @#A
    absolute_value: ($) => seq(choice("@", "*"), choice("#", "$"), field("value", $._expression)),
    // Mode 6: Relative           OPR A
    relative_value: ($) => field("value", $._expression),
    // Mode 7: Relative deferred  OPR @A
    indirect_relative_value: ($) => seq(choice("@", "*"), field("value", $._expression)),

    //-------------------------------------------------------------------------
    // Expressions:
    //-------------------------------------------------------------------------

    _expression: ($) =>
      choice(
        $.location_counter,
        $.local_label,
        $._numeric_literal,
        $.char_literal,
        $.string_literal,
        $.unary_expression,
        $.binary_expression,
        $.parenthesized_expression,
        $._identifier,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    location_counter: () => prec.right(field("location_counter", ".")),
    local_label: () => field("local_label", /\d+\$/),
    unary_expression: ($) =>
      prec(
        unaryPrec,
        seq(
          field("operator", alias(choice("+", "-", "!", "~"), $.operator)),
          field("operand", $._expression),
        ),
      ),

    binary_expression: ($) =>
      choice(
        ...binaryOperators.map((operator, i) =>
          prec.left(
            i,
            seq(
              field("left", $._expression),
              field("operator", alias(operator, $.operator)),
              field("right", $._expression),
            ),
          ),
        ),
      ),

    // Literals

    _numeric_literal: ($) =>
      choice(
        $.hexadecimal_literal,
        $.binary_literal,
        $.octal_literal,
        $.float_decimal_literal,
        $.decimal_literal,
      ),

    hexadecimal_literal: () => /0[xX][0-9A-Fa-f]+/,
    binary_literal: () => /0[bB][01]+/,
    octal_literal: () => /0[0-7]+/,
    float_decimal_literal: () => token.immediate(seq(/\d+/, ".", /\d+/)),
    decimal_literal: () => /[0-9]+/,

    char_literal: (_) => /'[\x00-\x7F]/,

    string_literal: ($) =>
      seq(
        '"',
        repeat(choice(prec(1, /[^"\n\\]+/), $.string_escape_code)),
        '"',
      ),

    string_escape_code: (_) =>
      choice(
        /\\[\\bfnrt"]/,           // Single char escape codes
        /\\[xX][0-9a-fA-F]{1,2}/, // Hex charcter code
        /\\[0-7]+/,               // Octal character code
      ),

    //--------------------------------------------------------------------------
    // Identifiers                                                           {{{
    //--------------------------------------------------------------------------
    _identifier: ($) => prec.right(
      choice(
        $.symbol,
        //$.interpolated,
        $.macro_arg,
      ),
    ),

    symbol: ($) => prec.right(seq($._symbol_chars, optional("$"))),
    _symbol_chars: () => /[a-zA-Z0-9_.]+/,

    interpolated: ($) => prec.right(
      repeat1(
        choice(
          $._symbol_chars,
          seq($.macro_arg, optional($.macro_arg_separator)),
          $.macro_execution_counter,
        ),
      ),
    ),

    macro_arg: () => /\\[a-zA-Z][a-zA-Z0-9_]+/,
    macro_arg_separator: () => "\\()",
    macro_execution_counter: () => "\\@",
    // }}}
    //----------------------------------------------------------------------
    // Misc:
    //----------------------------------------------------------------------
  },
});

function toCaseInsensitive(a) {
  var ca = a.charCodeAt(0);
  if (ca >= 97 && ca <= 122) return `[${a}${a.toUpperCase()}]`;
  if (ca >= 65 && ca <= 90) return `[${a.toLowerCase()}${a}]`;
  return a;
}

function caseInsensitive(keyword) {
  return new RegExp(keyword.split("").map(toCaseInsensitive).join(""));
}

function mnemonicChoice(options) {
  return choice(...options.map(caseInsensitive));
}

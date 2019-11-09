/* global goog Blockly */
'use strict'

goog.provide('Blockly.UnLisp')

goog.require('Blockly.Generator')
goog.require('Blockly.utils.string')

/**
 * UnLisp code generator.
 * @type {!Blockly.Generator}
 */
Blockly.UnLisp = new Blockly.Generator('UnLisp')

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.UnLisp.addReservedWords(
  '#t, #itr,' +
  'quote, cons, car, cdr, setq, setcar, while, gensym,' +
  'define, defun, defmacro, macroexpand, lambda, if, eq, print, eval, list,' +
  // user functions
  'task, led, ldr, rgb'
)

Blockly.UnLisp.ORDER_ATOMIC = 0
Blockly.UnLisp.ORDER_HIGH = 1
Blockly.UnLisp.ORDER_EXPONENTIATION = 2
Blockly.UnLisp.ORDER_UNARY = 3
Blockly.UnLisp.ORDER_MULTIPLICATIVE = 4
Blockly.UnLisp.ORDER_ADDITIVE = 5
Blockly.UnLisp.ORDER_CONCATENATION = 6
Blockly.UnLisp.ORDER_RELATIONAL = 7
Blockly.UnLisp.ORDER_AND = 8
Blockly.UnLisp.ORDER_OR = 9
Blockly.UnLisp.ORDER_NONE = 99

Blockly.UnLisp.ORDER_OVERRIDES = [
  [Blockly.UnLisp.ORDER_ADDITIVE, Blockly.UnLisp.ORDER_ADDITIVE],
  [Blockly.UnLisp.ORDER_MULTIPLICATIVE, Blockly.UnLisp.ORDER_MULTIPLICATIVE],
  [Blockly.UnLisp.ORDER_MULTIPLICATIVE, Blockly.UnLisp.ORDER_ADDITIVE]
]

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.UnLisp.init = function (workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.UnLisp.definitions_ = Object.create(null)
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.UnLisp.functionNames_ = Object.create(null)

  if (!Blockly.UnLisp.variableDB_) {
    Blockly.UnLisp.variableDB_ = new Blockly.Names(Blockly.UnLisp.RESERVED_WORDS_)
  } else {
    Blockly.UnLisp.variableDB_.reset()
  }
  Blockly.UnLisp.variableDB_.setVariableMap(workspace.getVariableMap())

  var defvars = []
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace)
  for (let i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.UnLisp.variableDB_.getName(devVarList[i], Blockly.Names.DEVELOPER_VARIABLE_TYPE))
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace)
  for (let i = 0; i < variables.length; i++) {
    defvars.push(Blockly.UnLisp.variableDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE))
  }

  // Declare all of the variables.
  Blockly.UnLisp.definitions_['variables'] = ''
  for (let i = 0; i < defvars.length; i++) {
    Blockly.UnLisp.definitions_['variables'] +=
      '(define ' + defvars[i] + ' ())\n'
  }
}

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.UnLisp.finish = function (code) {
  // Convert the definitions dictionary into a list.
  var definitions = []
  for (var name in Blockly.UnLisp.definitions_) {
    definitions.push(Blockly.UnLisp.definitions_[name])
  }
  // Clean up temporary data.
  delete Blockly.UnLisp.definitions_
  delete Blockly.UnLisp.functionNames_
  Blockly.UnLisp.variableDB_.reset()
  return definitions.join('') + '\n' + code
}

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.UnLisp.scrubNakedValue = function (line) {
  return line + '\n'
}
// DONE: ^^^^^^^^^^^^^^^^^^^^^ refactored/implemented














/**
 * Encode a string as a properly escaped UnLisp string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} UnLisp string.
 * @private
 */
Blockly.UnLisp.quote_ = function (string) {
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Encode a string as a properly escaped multiline UnLisp string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} UnLisp string.
 * @private
 */
Blockly.UnLisp.multiline_quote_ = function (string) {
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/'/g, '\\\'');
  return '[===' + string + '===]';
};

/**
 * Common tasks for generating UnLisp from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The UnLisp code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} UnLisp code with comments and subsequent blocks added.
 * @private
 */
Blockly.UnLisp.scrub_ = function (block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment,
        Blockly.UnLisp.COMMENT_WRAP - 3);
      commentCode += Blockly.UnLisp.prefixLines(comment, '-- ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.UnLisp.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.UnLisp.prefixLines(comment, '-- ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.UnLisp.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
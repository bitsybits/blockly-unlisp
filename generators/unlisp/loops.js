/* global goog Blockly */
'use strict'

goog.provide('Blockly.UnLisp.loops')

goog.require('Blockly.UnLisp')

function cleanCode (src) {
  var dst = src
  dst = dst.replace(/(\r\n|\n|\r)/gm, ' ')                // replace all newlines with spaces
  dst = dst.replace(/\s+/g, ' ').trim()                   // remove extra spaces
  dst = dst.replace(/\(?<=[(|[]\)\s+|\s+(?=[\]|)])/g, '') // remove all spaces before and after parentheses
  return dst
}

Blockly.UnLisp['unlisp_controls_repeat'] = function (block) {
  // Repeat n times.
  var repeats = 0
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')))
  } else {
    // External number.
    repeats = Blockly.UnLisp.valueToCode(block, 'TIMES', Blockly.UnLisp.ORDER_NONE) || '0'
  }
  var branch = Blockly.UnLisp.statementToCode(block, 'DO')
  branch = Blockly.UnLisp.addLoopTrap(branch, block)
  branch = branch || '()'
  // do not need this because #itr is an UnLisp system variable
  // var loopVar = Blockly.UnLisp.variableDB_.getDistinctName('#itr', Blockly.Variables.NAME_TYPE)
  return '(while (< #itr ' + repeats + ') ' + cleanCode(branch) + ')\n'
}

Blockly.UnLisp['unlisp_controls_whileUntil'] = function (block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') === 'UNTIL'
  var argument0 = Blockly.UnLisp.valueToCode(block, 'BOOL',
    until
      ? Blockly.UnLisp.ORDER_UNARY
      : Blockly.UnLisp.ORDER_NONE) || '()'
  var branch = Blockly.UnLisp.statementToCode(block, 'DO')
  branch = Blockly.UnLisp.addLoopTrap(branch, block)
  branch = branch || '()'
  if (until) {
    argument0 = '(! ' + argument0 + ')'
  }
  return '(while ' + argument0 + ' ' + cleanCode(branch) + ')\n'
}

Blockly.UnLisp['unlisp_while_itr'] = function (block) {
  return ['#itr', Blockly.UnLisp.ORDER_HIGH]
}

Blockly.UnLisp['controls_repeat'] = Blockly.UnLisp['unlisp_controls_repeat']
Blockly.UnLisp['controls_repeat_ext'] = Blockly.UnLisp['unlisp_controls_repeat']
Blockly.UnLisp['controls_whileUntil'] = Blockly.UnLisp['unlisp_controls_whileUntil']

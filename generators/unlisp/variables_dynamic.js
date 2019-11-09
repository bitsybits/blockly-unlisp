/* global goog Blockly */
'use strict'

goog.provide('Blockly.UnLisp.variablesDynamic')

goog.require('Blockly.UnLisp')
goog.require('Blockly.UnLisp.variables')

// UnLisp is dynamically typed.
Blockly.UnLisp['variables_get_dynamic'] = Blockly.UnLisp['variables_get']
Blockly.UnLisp['variables_set_dynamic'] = Blockly.UnLisp['variables_set']

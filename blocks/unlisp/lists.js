/* global goog Blockly */
'use strict'

goog.require('Blockly')

Blockly.defineBlocksWithJsonArray([{
  'type': 'unlisp_statement_list',
  'message0': 'create list %1',
  'args0': [{
    'type': 'input_statement',
    'name': 'LIST'
  }],
  'inputsInline': false,
  'output': null,
  'style': 'list_blocks',
  'tooltip': '',
  'helpUrl': ''
},
{
  'type': 'unlisp_list_car',
  'message0': 'head %1',
  'args0': [{
    'type': 'input_value',
    'name': 'LIST',
    'check': 'Array'
  }],
  'inputsInline': false,
  'output': null,
  'style': 'list_blocks',
  'tooltip': '',
  'helpUrl': ''
},
{
  'type': 'unlisp_list_cdr',
  'message0': 'tail %1',
  'args0': [{
    'type': 'input_value',
    'name': 'LIST',
    'check': 'Array'
  }],
  'inputsInline': false,
  'output': null,
  'style': 'list_blocks',
  'tooltip': '',
  'helpUrl': ''
}
])

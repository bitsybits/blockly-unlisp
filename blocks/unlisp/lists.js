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
  'message0': 'car %1',
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
  'message0': 'cdr %1',
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
  'type': 'unlisp_convert',
  'message0': '%1',
  'args0': [{
    'type': 'input_value',
    'name': 'VALUE'
  }],
  'inputsInline': false,
  'previousStatement': null,
  'nextStatement': null,
  'style': 'list_blocks',
  'tooltip': '',
  'helpUrl': ''
}
])

/* global goog Blockly */
'use strict'

goog.require('Blockly')

Blockly.defineBlocksWithJsonArray([
  {
    'type': 'unlisp_while_itr',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_label_serializable',
        'name': 'ITR',
        'text': 'iterator'
      }
    ],
    'output': 'N',
    'style': 'loop_blocks',
    'tooltip': 'DO NOT USE WITH REPEAT CYCLE',
    'helpUrl': ''
  }
])

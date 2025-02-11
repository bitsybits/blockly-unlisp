/* global goog Blockly */
'use strict'

goog.require('Blockly')

var TaskHelper = {
  TASK_TYPES: [
    'unlisp_special_task'
  ],

  /**
   * Is the given block enclosed (at any level) by a loop?
   * @param {!Blockly.Block} block Current block.
   * @return {Blockly.Block} The nearest surrounding loop, or null if none.
   */
  getSurroundLoop: function (block, loops = TaskHelper.TASK_TYPES) {
    // Is the block nested in a loop?
    do {
      if (loops.indexOf(block.type) !== -1) {
        return block
      }
      block = block.getSurroundParent()
    } while (block)
    return null
  },

  isChildExist: function (block, needle) {
    // TODO: refactoring
    if (block && block === needle) {
      return true
    }
    var blocks = block.getChildren()
    for (var i = 0; i < blocks.length; i++) {
      if (TaskHelper.isChildExist(blocks[i], needle)) {
        return true
      }
    }
    return false
  }
}

Blockly.defineBlocksWithJsonArray([
  {
    'type': 'unlisp_special_task',
    'message0': 'run task times %1 ms %2 do %3',
    'args0': [
      {
        'type': 'input_value',
        'name': 'TIMES',
        'check': 'Number'
      },
      {
        'type': 'input_value',
        'name': 'MS',
        'check': 'Number'
      },
      {
        'type': 'input_statement',
        'name': 'OBJ'
      }
    ],
    'inputsInline': true,
    'colour': '#9857ff',
    'tooltip': '',
    'helpUrl': '',
    'extensions': ['controls_flow_task_count_check']
  },
  {
    'type': 'unlisp_special_ldr',
    'message0': '%1',
    'args0': [{
      'type': 'field_label_serializable',
      'name': 'PASS',
      'text': 'light sensor'
    }],
    'inputsInline': true,
    'output': 'Number',
    'colour': '#9f42e6',
    'tooltip': '',
    'helpUrl': ''
  },
  {
    'type': 'unlisp_special_led',
    'message0': 'led id %1 state %2',
    'args0': [
      {
        'type': 'input_value',
        'name': 'ID',
        'check': 'Number'
      },
      {
        'type': 'input_value',
        'name': 'STATE',
        'check': [
          'Number',
          'Boolean'
        ]
      }
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'colour': '#9f42e6',
    'tooltip': '',
    'helpUrl': ''
  }
])

Blockly.Blocks['unlisp_special_task_pass'] = {
  // Value input.
  init: function () {
    this.jsonInit({
      'message0': '%1',
      'args0': [{
        'type': 'field_label_serializable',
        'name': 'PASS',
        'text': 'task pass'
      }],
      'inputsInline': true,
      'output': 'Number',
      'colour': '#9857ff',
      'tooltip': '',
      'helpUrl': ''
    })
  },

  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} _e Change event.
   * @this {Blockly.Block}
   */
  onchange: function (_e) {
    // TODO: check if ITR in REPEAT LOOP and disallow it
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return // Don't change state at the start of a drag.
    }
    var whyMsg = null
    var block = TaskHelper.getSurroundLoop(this)
    if (block) {
      for (let i = 0; i < 2; i++) {
        var haystack = block.inputList[i].connection.targetConnection.sourceBlock_
        if ((TaskHelper.TASK_TYPES.indexOf(block.type) !== -1) && TaskHelper.isChildExist(haystack, this)) {
          whyMsg = 'This constant returns a value. Do not use it to set up a task.'
          break
        }
      }
      if (!whyMsg) {
        this.setWarningText(null)
        if (!this.isInFlyout) {
          this.setEnabled(true)
        }
        return
      }
    } else {
      whyMsg = 'This block may only be used within a task'
    }
    this.setWarningText(whyMsg)
    if (!this.isInFlyout && !this.getInheritedDisabled()) {
      this.setEnabled(false)
    }
  }
}

Blockly.Constants.Loops.CONTROL_FLOW_TASK_COUNT_CHECK_MIXIN = {
  onchange: function (_e) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return // Don't change state at the start of a drag.
    }
    var taskCount = this.workspace.getTopBlocks(false)
      .reduce(function (count, block) {
        var blacklisted = TaskHelper.TASK_TYPES.indexOf(block.type) !== -1
        return count + (blacklisted ? 1 : 0)
      }, 0)
    if (taskCount > 1) {
      this.setWarningText('Only one task allowed')
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false)
      }
    } else {
      this.setWarningText(null)
      if (!this.isInFlyout) {
        this.setEnabled(true)
      }
    }
  }
}

Blockly.Extensions.registerMixin('controls_flow_task_count_check', Blockly.Constants.Loops.CONTROL_FLOW_TASK_COUNT_CHECK_MIXIN)

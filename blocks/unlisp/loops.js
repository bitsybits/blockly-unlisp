/* global goog Blockly */
'use strict'

goog.require('Blockly')

Blockly.Blocks['unlisp_while_itr'] = {
  // Value input.
  init: function () {
    this.jsonInit({
      'message0': '%1',
      'args0': [{
        'type': 'field_label_serializable',
        'name': 'ITR',
        'text': 'iterator'
      }],
      'output': 'Number',
      'style': 'loop_blocks',
      'tooltip': 'DO NOT USE WITH REPEAT CYCLE',
      'helpUrl': ''
    })
  },

  LOOP_TYPES: [
    'controls_repeat',
    'controls_repeat_ext',
    'controls_forEach',
    'controls_for',
    'controls_whileUntil'
  ],

  /**
   * Don't automatically add STATEMENT_PREFIX and STATEMENT_SUFFIX to generated
   * code.  These will be handled manually in this block's generators.
   */
  suppressPrefixSuffix: true,

  /**
   * Is the given block enclosed (at any level) by a loop?
   * @param {!Blockly.Block} block Current block.
   * @return {Blockly.Block} The nearest surrounding loop, or null if none.
   */
  getSurroundLoop: function (block) {
    // Is the block nested in a loop?
    do {
      if (Blockly.Blocks['unlisp_while_itr'].LOOP_TYPES.indexOf(block.type) !== -1) {
        return block
      }
      block = block.getSurroundParent()
    } while (block)
    return null
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
      return; // Don't change state at the start of a drag.
    }
    if (Blockly.Blocks['unlisp_while_itr'].getSurroundLoop(this)) {
      this.setWarningText(null)
      if (!this.isInFlyout) {
        this.setEnabled(true)
      }
    } else {
      this.setWarningText(Blockly.Msg['CONTROLS_FLOW_STATEMENTS_WARNING'])
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false)
      }
    }
  }
}

// TODO: disallow nested loops
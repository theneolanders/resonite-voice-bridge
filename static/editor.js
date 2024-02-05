Blockly.Blocks['comment_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Comment")
    this.appendDummyInput()
      .appendField(new Blockly.FieldMultilineInput("Comment text.\nSupports multiple lines."), "TEXT")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#808080');
    this.setTooltip("A comment block. Useful for documentation.");
  }
};

Blockly.Blocks['container_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Wake word')
      .appendField(new Blockly.FieldTextInput('Jarvis'), 'WAKE_WORD')
      .appendField('Optional')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'WAKE_WORD_OPTIONAL');
    this.appendStatementInput('CONTENT')
    this.setColour('#444444');
    this.setTooltip('The top level block for a command. Requires at least one command block.');
    this.contextMenu = false;
    this.deletable_ = false;
    this.movable_ = false;
  }
};

Blockly.Blocks['command_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Trigger")
      .appendField(new Blockly.FieldTextInput("Trigger"), "TRIGGER")
      .appendField("Command")
      .appendField(new Blockly.FieldTextInput("Command Name"), "COMMAND_NAME");
    this.setPreviousStatement(true, "multi_text_block");
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("A command block.");
  }
};

Blockly.Blocks['no_trigger_command_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Command")
      .appendField(new Blockly.FieldTextInput("Command Name"), "COMMAND_NAME");
    this.setPreviousStatement(true, "multi_text_block");
    this.setNextStatement(true, null);
    this.setColour(190);
    this.setTooltip("A command block that does not require a trigger.");
  }
};

Blockly.Blocks['parameter_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Value Name")
      .appendField(new Blockly.FieldTextInput("Value Name"), "VAL_NAME");
    this.appendDummyInput()
      .appendField("Type")
      .appendField(new Blockly.FieldDropdown([["Text", "text"], ["Number", "number"]]), "TYPE");
    // Adding length parameter
    this.appendDummyInput()
      .appendField("Words")
      .appendField(new Blockly.FieldNumber(0, 1, Infinity, 1), "LENGTH");
    this.setPreviousStatement(true, "multi_text_block");
    this.setNextStatement(true, null);
    this.setColour(130);
    this.setTooltip("A value block.");
  }
};

Blockly.Blocks['text_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Text")
      .appendField(new Blockly.FieldTextInput("Filler Text"), "FILLER_TEXT");
    this.appendDummyInput()
      .appendField('Optional')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'OPTIONAL');
    this.setPreviousStatement(true, ["text_block", "multi_text_block"]);
    this.setNextStatement(true, null);
    this.setColour('#a5985b');
    this.setTooltip("A text block.");
  }
};

Blockly.Blocks['multi_text_block'] = {
  init: function () {
    this.appendStatementInput('CONTENT')
      .setCheck(["multi_text_text_block"])
      .appendField('OR')
    this.appendDummyInput()
      .appendField('Optional')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'OPTIONAL');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('a52b67');
    this.setTooltip('A block that can contain multiple text blocks, only one needs to match.');
  }
};

Blockly.Blocks['multi_text_text_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Option")
      .appendField(new Blockly.FieldTextInput("OR Text option"), "OR_TEXT");
    this.setPreviousStatement(true, ['multi_text_block', 'multi_text_text_block']);
    this.setNextStatement(true, ['multi_text_text_block']);
    this.setColour('7a1f4d');
    this.setTooltip("A text block for an OR text block.");
  }
};

Blockly.Blocks['multi_trigger_command_block'] = {
  init: function () {
    this.appendStatementInput('CONTENT')
      .setCheck(["multi_trigger_command_text_block"])
      .appendField('Triggers')
    this.appendDummyInput()
      .appendField("Command Name")
      .appendField(new Blockly.FieldTextInput("Command"), "COMMAND_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('A command block that can contain multiple trigger blocks, only one needs to match.');
  }
};

Blockly.Blocks['multi_trigger_command_text_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Trigger")
      .appendField(new Blockly.FieldTextInput("Trigger Text option"), "TRIGGER_TEXT");
    this.setPreviousStatement(true, ['multi_trigger_command_block', 'multi_trigger_command_text_block']);
    this.setNextStatement(true, ['multi_trigger_command_text_block']);
    this.setColour('#452b67');
    this.setTooltip("A trigger block for a multi-trigger command block.");
  }
};

const defaultBlock = '{"blocks":{"languageVersion":0,"blocks":[{"type":"container_block","id":"i/)s$zu85s8z/%wou!Gi","x":15,"y":15,"deletable":false,"fields":{"WAKE_WORD":"Jarvis","WAKE_WORD_OPTIONAL":false}}]}}';

let isWorkspaceChanged = false;

let saveName = '';

function initBlockly() {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox')
  });

  workspace.addChangeListener((event) => {
    if (event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_CHANGE) {
      isWorkspaceChanged = true;
      const unsaved = document.getElementById('unsaved');
      unsaved.style.display = 'inline';
      document.getElementById('save-btn').disabled = false;
    }
  });

  return workspace;
}

function checkForUnsavedChanges() {
  if (isWorkspaceChanged) {
    return confirm("You have unsaved changes. Are you sure you want to discard them?");
  }
  return true;
}

const workspace = initBlockly();

function workspaceToJson() {
  const json = Blockly.serialization.workspaces.save(workspace);
  return json;
}

function workspaceFromJson(xml) {
  workspace.clear();
  Blockly.serialization.workspaces.load(xml, workspace);
}

function clearWorkspace() {
  if (checkForUnsavedChanges()) {
    workspace.clear();
    workspaceFromJson(JSON.parse(defaultBlock));
    console.log('Cleared workspace');
    isWorkspaceChanged = false;
    const commandName = document.getElementById('command-name');
    commandName.innerHTML = 'New Command';
    resetModified();
  }
}

function getBlockDetails() {
  const workspace = Blockly.getMainWorkspace();
  const allBlocks = workspace.getAllBlocks();

  const organizedBlocks = {};

  let currentContainerBlockId = null;
  let currentMultiTextBlockId = null;
  let currentMultiTriggerCommandBlockId = null;

  allBlocks.forEach(block => {
    if (block.type === 'container_block') {
      organizedBlocks[block.id] = {
        id: block.id,
        type: block.type,
        fields: {
          wake_word: workspace.getBlockById(block.id).getFieldValue('WAKE_WORD'),
          wake_word_optional: workspace.getBlockById(block.id).getFieldValue('WAKE_WORD_OPTIONAL') === 'TRUE' ? true : false
        },
        children: []
      }
      currentContainerBlockId = block.id;
    } else if (block.type === 'command_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          command_name: workspace.getBlockById(block.id).getFieldValue('COMMAND_NAME'),
          trigger: workspace.getBlockById(block.id).getFieldValue('TRIGGER'),
        }
      })
    } else if (block.type === 'no_trigger_command_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          command_name: workspace.getBlockById(block.id).getFieldValue('COMMAND_NAME'),
        }
      })
    } else if (block.type === 'parameter_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          name: workspace.getBlockById(block.id).getFieldValue('VAL_NAME'),
          type: workspace.getBlockById(block.id).getFieldValue('TYPE'),
          len: workspace.getBlockById(block.id).getFieldValue('LENGTH'),
        }
      })
    } else if (block.type === 'text_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          text: workspace.getBlockById(block.id).getFieldValue('FILLER_TEXT'),
          optional: workspace.getBlockById(block.id).getFieldValue('OPTIONAL') === 'TRUE' ? true : false,
        }
      })
    } else if (block.type === 'multi_text_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          text_blocks: [],
          optional: workspace.getBlockById(block.id).getFieldValue('OPTIONAL') === 'TRUE' ? true : false,
        }
      })
      currentMultiTextBlockId = block.id;
    } else if (block.type === 'multi_text_text_block') {
      const currentMultiTextBlockIndex = organizedBlocks[currentContainerBlockId].children.findIndex(block => block.id === currentMultiTextBlockId);
      organizedBlocks[currentContainerBlockId].children[currentMultiTextBlockIndex].fields.text_blocks.push(
        workspace.getBlockById(block.id).getFieldValue('OR_TEXT')
      )
    } else if (block.type === 'multi_trigger_command_block') {
      organizedBlocks[currentContainerBlockId].children.push({
        id: block.id,
        type: block.type,
        fields: {
          command_name: workspace.getBlockById(block.id).getFieldValue('COMMAND_NAME'),
          trigger_blocks: []
        }
      });
      currentMultiTriggerCommandBlockId = block.id;
    } else if (block.type === 'multi_trigger_command_text_block') {
      const currentMultiTriggerCommandBlockIndex = organizedBlocks[currentContainerBlockId].children.findIndex(block => block.id === currentMultiTriggerCommandBlockId);
      organizedBlocks[currentContainerBlockId].children[currentMultiTriggerCommandBlockIndex].fields.trigger_blocks.push(
        workspace.getBlockById(block.id).getFieldValue('TRIGGER_TEXT')
      );
    }
  });

  return organizedBlocks;
}

function parseInputAgainstCommand(inputString) {
  const blocks = getBlockDetails();
  let inputParts = inputString.toLowerCase().split(' ');

  let output = {};

  for (blockId in blocks) {
    output = {};

    const containerBlock = blocks[blockId];

    const wakeWordIndex = inputParts.indexOf(containerBlock.fields.wake_word.toLowerCase());
    console.log('Wake word index:', wakeWordIndex);
    if (wakeWordIndex === -1 && !containerBlock.fields.wake_word_optional) {
      if (!containerBlock.fields.wake_word_optional) {
        output = {
          'error': 'Wake word not found',
          'user input': inputParts[0],
          'valid wake word': containerBlock.fields.wake_word
        }
        console.log('Invalid wake word');
        break;
      }
    } else {
      inputParts = inputParts.slice(wakeWordIndex + 1, inputParts.length);
    }

    let inputPartsIndex = 0;

    for (let i = 0; i < containerBlock.children.length; i++) {
      const block = containerBlock.children[i];

      if (block.type === 'no_trigger_command_block') {
        output['command'] = block.fields.command_name;
      } else if (block.type === 'command_block') {
        const triggerText = block.fields.trigger.toLowerCase();
        const triggerParts = triggerText.split(' ');
        inputTriggerText = inputParts[inputPartsIndex];
        if (triggerText.includes(' ')) {
          inputTriggerText = inputParts.slice(inputPartsIndex, inputPartsIndex + triggerParts.length).join(' ');
        }

        if (triggerText === inputTriggerText) {
          output['command'] = block.fields.command_name;
          inputPartsIndex += triggerParts.length;
        } else if (!block.fields.optional) {
          output = {
            'error': 'User input does not match',
            'user input': inputTriggerText,
            'valid trigger': triggerText
          }
          i = containerBlock.children.length;
        }
      } else if (block.type === 'parameter_block') {
        output[block.fields.name] = inputParts.slice(inputPartsIndex, inputPartsIndex + block.fields.len).join(' ');
        inputPartsIndex += block.fields.len;
      } else if (block.type === 'text_block') {
        const textBlockText = block.fields.text.toLowerCase();
        const textBlockParts = textBlockText.split(' ');
        inputTextBlockText = inputParts[inputPartsIndex];
        if (textBlockText.includes(' ')) {
          inputTextBlockText = inputParts.slice(inputPartsIndex, inputPartsIndex + textBlockParts.length).join(' ');
        }

        if (textBlockText !== inputTextBlockText) {
          if (!block.fields.optional) {
            output = {
              'error': 'User input does not match',
              'user input': inputTextBlockText,
              'valid text': textBlockText
            }
            i = containerBlock.children.length;
          }
        } else {
          // Skip the optional text block
          inputPartsIndex += textBlockParts.length;
        }
      } else if (block.type === 'multi_text_block') {
        const textBlocks = block.fields.text_blocks.map(textBlock => textBlock.toLowerCase());

        let foundMatch = false;

        for (let j = 0; j < textBlocks.length; j++) {
          const textBlock = textBlocks[j];
          const textBlockParts = textBlock.split(' ');
          inputTextBlockText = inputParts.slice(inputPartsIndex, inputPartsIndex + textBlockParts.length).join(' ');
          if (textBlock === inputTextBlockText) {
            inputPartsIndex += textBlockParts.length;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          if (!block.fields.optional) {
            output = {
              'error': 'User input does not match any elements in OR text block',
              'user input': inputParts[inputPartsIndex],
              'valid options': textBlocks.join(', ')
            }
            i = containerBlock.children.length;
          }
        }
      } else if (block.type === 'multi_trigger_command_block') {
        const triggerBlocks = block.fields.trigger_blocks.map(triggerBlock => triggerBlock.toLowerCase());

        let foundMatch = false;

        for (let j = 0; j < triggerBlocks.length; j++) {
          const triggerBlock = triggerBlocks[j];
          const triggerBlockParts = triggerBlock.split(' ');
          inputTriggerBlockText = inputParts.slice(inputPartsIndex, inputPartsIndex + triggerBlockParts.length).join(' ');
          if (triggerBlock === inputTriggerBlockText) {
            inputPartsIndex += triggerBlockParts.length;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          output = {
            'error': 'User input does not match any elements in multi-trigger command block',
            'user input': inputParts[inputPartsIndex],
            'valid options': triggerBlocks.join(', ')
          }
          i = containerBlock.children.length;
        }

        output['command'] = block.fields.command_name;
      }
    }
  };

  return output || {};
}

document.getElementById('validate-btn').addEventListener('click', () => {
  const workspace = Blockly.getMainWorkspace();

  let outputString = '';
  const blocks = workspace.getAllBlocks(false);

  const inputString = document.getElementById('validate-input').value;

  output = parseInputAgainstCommand(inputString);

  for (const [key, value] of Object.entries(output)) {
    outputString += `${key}: ${value}\n`;
  }

  document.getElementById('output').innerText = outputString;
});

function updateSavedCommandsDropdown() {
  const dropdown = document.getElementById('saved-commands-dropdown');
  dropdown.innerHTML = '';
  const commands = JSON.parse(localStorage.getItem('savedCommands')) || {};
  Object.keys(commands).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    dropdown.appendChild(option);
  });
}

function resetModified() {
  setTimeout(() => {
    isWorkspaceChanged = false;
    const unsaved = document.getElementById('unsaved');
    unsaved.style.display = 'none';
    document.getElementById('save-btn').disabled = true;
  }, 100);
}

function saveCommand() {
  if (!saveName.length) {
    saveName = prompt('Enter a name for the command:');
  }
  const xml = workspaceToJson();
  if (saveName) {
    let savedCommands = JSON.parse(localStorage.getItem('savedCommands')) || {};
    savedCommands[saveName] = {
      xml: xml,
      blockDetails: getBlockDetails()
    };
    localStorage.setItem('savedCommands', JSON.stringify(savedCommands));
    console.log('Command saved:', saveName);
    updateSavedCommandsDropdown();
    isWorkspaceChanged = false;
    const unsaved = document.getElementById('unsaved');
    unsaved.style.display = 'none';
    document.getElementById('save-btn').disabled = true;
  }
}

function loadSelectedCommand() {
  if (checkForUnsavedChanges()) {
    const selectedCommand = document.getElementById('saved-commands-dropdown').value;
    const savedCommands = JSON.parse(localStorage.getItem('savedCommands')) || {};
    if (savedCommands[selectedCommand]) {
      workspaceFromJson(savedCommands[selectedCommand]['xml']);
      console.log('Loaded command:', selectedCommand);
    } else {
      console.log('No command found with name:', selectedCommand);
    }
    const commandName = document.getElementById('command-name');
    commandName.innerHTML = selectedCommand;
    saveName = selectedCommand;
    resetModified();
  }
}


function deleteSelectedCommand() {
  const selectedCommand = document.getElementById('saved-commands-dropdown').value;
  let savedCommands = JSON.parse(localStorage.getItem('savedCommands')) || {};

  if (savedCommands[selectedCommand]) {
    // Confirmation prompt
    const isConfirmed = confirm(`Are you sure you want to delete the command "${selectedCommand}"?`);
    if (isConfirmed) {
      delete savedCommands[selectedCommand];
      localStorage.setItem('savedCommands', JSON.stringify(savedCommands));
      console.log('Deleted command:', selectedCommand);
      updateSavedCommandsDropdown();
      clearWorkspace();
    } else {
      console.log('Deletion cancelled.');
    }
  } else {
    console.log('No command found with name:', selectedCommand);
  }
}

document.getElementById('clear-btn').addEventListener('click', () => {
  clearWorkspace();
});

document.getElementById('export-btn').addEventListener('click', () => {
  let downloadName = saveName.length ? saveName : `new-${Date.now()}`;
  workspaceJson = JSON.stringify({
    name: downloadName,
    xml: workspaceToJson()
  });
  const blob = new Blob([workspaceJson], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `rvb-command-${downloadName}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  console.log('Exported workspace to file');
});

document.getElementById('import-btn').addEventListener('click', () => {
  if (checkForUnsavedChanges()) {
    document.getElementById('file-input').click();
  }
});

document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const json = JSON.parse(text);
        saveName = json['name'];
        const commandName = document.getElementById('command-name');
        commandName.innerHTML = saveName;
        isWorkspaceChanged = true;
        const unsaved = document.getElementById('unsaved');
        unsaved.style.display = 'inline';
        document.getElementById('save-btn').disabled = false;
        workspaceFromJson(json['xml']);
        console.log('Imported workspace from file');
      } catch (e) {
        console.error('Error importing file:', e);
        alert('Error in importing file. Ensure the file is a valid command JSON.');
      }
    };
    reader.readAsText(file);
  }
});

document.getElementById('save-btn').addEventListener('click', () => {
  const xml = workspaceToJson();
  localStorage.setItem('blocklyWorkspace', JSON.stringify(xml));
  console.log('Workspace saved to localStorage');
});

document.getElementById('delete-btn').addEventListener('click', deleteSelectedCommand);
document.getElementById('save-btn').addEventListener('click', saveCommand);
document.getElementById('load-selected-btn').addEventListener('click', loadSelectedCommand);

window.addEventListener('load', function () {
  clearWorkspace();
  updateSavedCommandsDropdown();
});
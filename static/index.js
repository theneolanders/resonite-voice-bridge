let url = "ws://localhost:6789";
let recognition;
let websocket;

let output;
let transcript = '';
const clearBtn = document.getElementById('clearBtn');

let selectedLanguage = 'en-US';
const langSelect = document.getElementById('languageSelect');

let manuallyCleared = false;
let clearedSection = '';

let debugModeEnabled = false;
const debugModeCheckbox = document.getElementById('debugModeCheckbox');

let micEnabled = false;
const toggleMicButton = document.getElementById('toggleMicBtn');

let customCommmandsEnabled = false;
const customCommandsCheckbox = document.getElementById('customCommandsCheckbox');

const commandLog = document.getElementById('commandLog');

let useConfidenceThreshold = false;
let confidenceThreshold = 0;
const confidenceThresholdWrapper = document.getElementById('confidenceThresholdWrapper');
const confidenceThresholdInputWrapper = document.getElementById('confidenceThresholdInputWrapper');
const confidenceThresholdCheckbox = document.getElementById('confidenceThresholdCheckbox');
const confidenceThresholdInput = document.getElementById('confidenceThresholdInput');

let wordReplacementEnabled = false;
const wordReplacementCheckbox = document.getElementById('wordReplacementCheckbox');
const addWordPairBtn = document.getElementById('addWordPairBtn');

let removePunctuation = false;
const removePunctuationCheckbox = document.getElementById('removePunctuationCheckbox');

let outputStreaming = true;
const outputStreamingCheckbox = document.getElementById('outputStreamingCheckbox');

let wordDictionary = {};

function init() {
  output = document.getElementById("output");
  websocket = new WebSocket(url);

  websocket.onopen = function (e) { onOpen(e); };
  websocket.onmessage = function (e) { onMessage(e); };
  websocket.onerror = function (e) { onError(e); };
  websocket.onclose = function (e) { onClose(e); };

  initializeRecognition();

  toggleMicButton.addEventListener('click', toggleMic);
  langSelect.addEventListener('change', changeLanguage);
  clearBtn.addEventListener('click', clearTranscript);
  wordReplacementCheckbox.addEventListener('change', () => {
    wordReplacementEnabled = wordReplacementCheckbox.checked;
    websocket.send(wordReplacementEnabled ? '[replacementEnabled]' : '[replacementDisabled]');
    saveSettings();
  });

  debugModeCheckbox.addEventListener('change', () => {
    debugModeEnabled = debugModeCheckbox.checked;

    confidenceThresholdWrapper.style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";
    confidenceThresholdInputWrapper.style.display = useConfidenceThreshold ? "block" : "none";
    document.getElementById("confidenceValue").style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";

    if (debugModeEnabled) websocket.send('[debugEnabled]');
    else websocket.send('[debugDisabled]');
    saveSettings();
  });

  customCommandsCheckbox.addEventListener('change', () => {
    customCommmandsEnabled = customCommandsCheckbox.checked;
    if (customCommmandsEnabled) websocket.send('[customCommandsEnabled]');
    else websocket.send('[customCommandsDisabled]');
    saveSettings();
  })

  removePunctuationCheckbox.addEventListener('change', () => {
    removePunctuation = removePunctuationCheckbox.checked;
    if (removePunctuation) websocket.send('[removePunctuationEnabled]');
    else websocket.send('[removePunctuationDisabled]');
    saveSettings();
  });

  outputStreamingCheckbox.addEventListener('change', () => {
    outputStreaming = outputStreamingCheckbox.checked;
    if (outputStreaming) websocket.send('[outputStreamingEnabled]');
    else websocket.send('[outputStreamingDisabled]');
    saveSettings();
  });

  confidenceThresholdCheckbox.addEventListener('change', () => {
    useConfidenceThreshold = confidenceThresholdCheckbox.checked;
    setUseConfidenceThreshold();
    saveSettings();
  });

  confidenceThresholdInput.addEventListener('input', () => {
    const prevValue = confidenceThreshold;
    if (prevValue === parseFloat(confidenceThresholdInput.value)) return;
    confidenceThreshold = parseFloat(confidenceThresholdInput.value);
    if (!isNaN(confidenceThreshold)) websocket.send('[setConfidence=' + confidenceThreshold + ']');
    saveSettings();
  });

  addWordPairBtn.addEventListener('click', addWordPair);
  loadSetings();
  checkMicrophoneAccess();
  renderWordPairs();
}

function loadSetings() {
  wordReplacementEnabled = localStorage.getItem('wordReplacementEnabled') === 'true';
  wordReplacementCheckbox.checked = wordReplacementEnabled;
  wordDictionary = JSON.parse(localStorage.getItem('wordDictionary') || {});
  renderWordPairs();

  debugModeEnabled = localStorage.getItem('debugModeEnabled') === 'true';
  debugModeCheckbox.checked = debugModeEnabled;

  customCommmandsEnabled = localStorage.getItem('customCommandsEnabled') === 'true';
  customCommandsCheckbox.checked = customCommmandsEnabled;

  useConfidenceThreshold = localStorage.getItem('useConfidenceThreshold') === 'true';
  confidenceThreshold = parseFloat(localStorage.getItem('confidenceThreshold'));
  confidenceThresholdCheckbox.checked = useConfidenceThreshold;
  confidenceThresholdInput.value = confidenceThreshold;

  confidenceThresholdWrapper.style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";
  confidenceThresholdInputWrapper.style.display = useConfidenceThreshold ? "block" : "none";
  document.getElementById("confidenceValue").style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";

  selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
  langSelect.value = selectedLanguage;

  removePunctuation = localStorage.getItem('removePunctuation') === 'true';
  removePunctuationCheckbox.checked = removePunctuation;

  outputStreaming = localStorage.getItem('outputStreaming') === 'true';
  outputStreamingCheckbox.checked = outputStreaming;
}

function saveSettings() {
  localStorage.setItem('wordReplacementEnabled', wordReplacementEnabled);
  localStorage.setItem('debugModeEnabled', debugModeEnabled);
  localStorage.setItem('customCommandsEnabled', customCommmandsEnabled);
  localStorage.setItem('useConfidenceThreshold', useConfidenceThreshold);
  localStorage.setItem('confidenceThreshold', confidenceThreshold);
  localStorage.setItem('wordDictionary', JSON.stringify(wordDictionary));
  localStorage.setItem('selectedLanguage', selectedLanguage);
  localStorage.setItem('removePunctuation', removePunctuation);
  localStorage.setItem('outputStreaming', outputStreaming);
}

function initializeRecognition() {
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = langSelect.value;
  recognition.interimResults = true;
  recognition.continuous = false; // Required to receive the end event for more accurate deduplication
  transcript = '';
  recognition.addEventListener('result', onSpeechRecognized);
  recognition.addEventListener('end', onSpeechEnded);
}

function checkMicrophoneAccess() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      stream.getTracks().forEach(track => track.stop());
      micEnabled = true;
      updateMic();
    })
    .catch(err => {
      console.error('Microphone access denied:', err);
      micEnabled = false;
      updateMic();
      document.getElementById("error").innerHTML = `<span style="color: red;">Microphone access denied. Please allow microphone access to use this feature.</span>`;
      showError();
    });
}

function changeLanguage() {
  const micWasEnabled = micEnabled;
  if (micEnabled) toggleMic();
  recognition.lang = langSelect.value;
  websocket.send("[lang=" + langSelect.value + "]");
  saveSettings();
  const timeout = setTimeout(() => {
    if (micWasEnabled) toggleMic();
    clearTimeout(timeout);
  }, 1000);
}

function toggleMic() {
  micEnabled = !micEnabled;
  updateMic();
}

function updateMic() {
  if (micEnabled) {
    recognition.lang = langSelect.value;
    recognition.start();
  }
  else recognition.stop();
  document.getElementById("micStatus").innerHTML = micEnabled ? '<span style="color: green;">Listening</span>' : '<span style="color: red;">Not Listening</span>';
  websocket.send(micEnabled ? "[enabled] " : "[disabled]");
  saveSettings();
}

function replaceWords(text) {
  return text.split(' ').map(word => wordDictionary[word] || word).join(' ');
}

function stripPunctuation(text) {
  return text.replace(/[^a-zA-Z0-9 ]/g, '');
}

function renderWordPairs() {
  const wordPairList = document.getElementById('wordPairList');
  wordPairList.innerHTML = '';
  Object.keys(wordDictionary).forEach((key) => {
    const pairDiv = document.createElement('div');
    pairDiv.innerHTML = `
      <span>${key}: ${wordDictionary[key]}</span>
      <button onclick="editWordPair('${key}')">Edit</button>
      <button onclick="deleteWordPair('${key}')">Delete</button>
    `;
    wordPairList.appendChild(pairDiv);
  });
}

function addWordPair() {
  const originalWord = document.getElementById('originalWord').value;
  const replacementWord = document.getElementById('replacementWord').value;
  if (originalWord && replacementWord) {
    wordDictionary[originalWord] = replacementWord;
    renderWordPairs();
  }
  saveSettings();
}

function deleteWordPair(key) {
  delete wordDictionary[key];
  renderWordPairs();
  saveSettings();
}

function editWordPair(key) {
  // Prompt because I am lazy
  const newReplacement = prompt(`Enter replacement for '${key}':`, wordDictionary[key]);
  if (newReplacement !== null) {
    wordDictionary[key] = newReplacement;
    renderWordPairs();
  }
  saveSettings();
}

function onSpeechRecognized(e) {
  const recognized = e.results[0][0];
  document.getElementById("confidenceScore").textContent = recognized.confidence.toFixed(2);
  if (useConfidenceThreshold && recognized.confidence < confidenceThreshold) return;

  let processedTranscript = recognized.transcript;
  if (removePunctuation) {
    processedTranscript = stripPunctuation(processedTranscript);
  }

  if (wordReplacementEnabled) {
    processedTranscript = replaceWords(processedTranscript);
  }

  if (processedTranscript !== transcript && processedTranscript.length > transcript.length) {
    if (manuallyCleared) {
      transcript = processedTranscript.replace(clearedSection, '');
    } else transcript = processedTranscript;

    document.getElementById("sttOutput").innerHTML = transcript;
    if (outputStreaming) websocket.send(transcript);

    if (debugModeEnabled) websocket.send('[debugConfidence=' + recognized.confidence.toFixed(2) + ']');
  }
}

function onSpeechEnded() {
  if (micEnabled) recognition.start();
  if (transcript.length) {
    if (!outputStreaming) websocket.send(transcript);
    websocket.send('[speechEnded]');
  }
  transcript = '';
  clearedSection = '';
  manuallyCleared = false;
}

function onOpen(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: green;">Connected to backend</span>';
}

function onMessage(event) {
  if (event.data === "toggle") toggleMic();
  else if (event.data === "enable") {
    micEnabled = true;
    updateMic();
  } else if (event.data === "disable") {
    micEnabled = false;
    updateMic();
  } else if (event.data.startsWith('lang=')) {
    const langCode = event.data.substring(5, event.data.length);
    selectedLanguage = langCode;
    langSelect.value = selectedLanguage;
    changeLanguage();
  } else if (event.data === 'clear') clearTranscript();
  else if (event.data === 'debugEnable') {
    if (debugModeEnabled) return;
    debugModeEnabled = true;
    setDebugMode();
  } else if (event.data === 'debugDisable') {
    if (!debugModeEnabled) return;
    debugModeEnabled = false;
    setDebugMode();
  } else if (event.data === 'debugToggle') {
    debugModeEnabled = !debugModeEnabled;
    setDebugMode();
  } else if (event.data === 'confidenceToggle') {
    useConfidenceThreshold = !useConfidenceThreshold;
    setUseConfidenceThreshold();
  } else if (event.data === 'confidenceEnable') {
    useConfidenceThreshold = true;
    setUseConfidenceThreshold();
  } else if (event.data === 'confidenceDisable') {
    useConfidenceThreshold = false;
    setUseConfidenceThreshold();
  } else if (event.data.startsWith('confidence=')) {
    confidenceThreshold = parseFloat(event.data.substring(11, event.data.length));
    confidenceThresholdInput.value = confidenceThreshold;
    websocket.send('[changedConfidence=' + confidenceThreshold + ']');
  } else if (event.data === 'replacementEnable') {
    wordReplacementEnabled = true;
    saveSettings();
  } else if (event.data === 'replacementDisable') {
    wordReplacementEnabled = false;
    saveSettings();
  } else if (event.data === 'replacementToggle') {
    wordReplacementEnabled = !wordReplacementEnabled;
    saveSettings();
  } else if (event.data === 'removePunctuationEnable') {
    removePunctuation = true;
    websocket.send('[removePunctuationEnabled]');
  } else if (event.data === 'removePunctuationDisable') {
    removePunctuation = false;
    websocket.send('[removePunctuationDisabled]');
  } else if (event.data === 'removePunctuationToggle') {
    removePunctuation = !removePunctuation;
    if (removePunctuation) websocket.send('[removePunctuationEnabled]');
    else websocket.send('[removePunctuationDisabled]');
  } else if (event.data === 'outputStreamingEnable') {
    outputStreaming = true;
    websocket.send('[outputStreamingEnabled]');
  } else if (event.data === 'outputStreamingDisable') {
    outputStreaming = false;
    websocket.send('[outputStreamingDisabled]');
  } else if (event.data === 'outputStreamingToggle') {
    outputStreaming = !outputStreaming;
    if (outputStreaming) websocket.send('[outputStreamingEnabled]');
    else websocket.send('[outputStreamingDisabled]');
  }
}

function setUseConfidenceThreshold() {
  confidenceThresholdCheckbox.checked = useConfidenceThreshold;
  confidenceThresholdWrapper.style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";
  confidenceThresholdInputWrapper.style.display = useConfidenceThreshold ? "block" : "none";
  document.getElementById("confidenceValue").style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";
  if (useConfidenceThreshold) websocket.send('[enableConfidenceThreshold]');
  else websocket.send('[disableConfidenceThreshold]');
  saveSettings();
}

function setDebugMode() {
  debugModeCheckbox.checked = debugModeEnabled;

  confidenceThresholdWrapper.style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";
  confidenceThresholdInputWrapper.style.display = useConfidenceThreshold ? "block" : "none";
  document.getElementById("confidenceValue").style.display = useConfidenceThreshold || debugModeEnabled ? "block" : "none";

  if (debugModeEnabled) websocket.send('[debugEnabled]');
  else websocket.send('[debugDisabled]');
  saveSettings();
}

function clearTranscript() {
  clearedSection = transcript;
  manuallyCleared = true;
  document.getElementById("sttOutput").innerHTML = '';
  websocket.send("[cleared]");
}

function onError(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">ERROR: ' + event.data + '</span>';
}

function onClose(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">Disconnected from backend</span>';
}

function exportWordDictionary() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wordDictionary));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "rvb-word-replacement-dictionary.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function importWordDictionary(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedDict = JSON.parse(event.target.result);
      wordDictionary = importedDict;
      renderWordPairs();
      saveSettings();
    } catch (error) {
      console.error('Error importing word dictionary:', error);
      alert('Invalid file format');
    }
  };
  const file = event.target.files[0];
  if (file) {
    fileReader.readAsText(file);
  }
}

function addCommandLogEntry(details) {
  // Generate a human readable datetime string
  const datetime = new Date();
  const dateString = datetime.toLocaleDateString();
  const timeString = datetime.toLocaleTimeString();

  let outputString = `<div class="log-entry"><div class="log-header"><span class="output-datime">${dateString} ${timeString}</span>
    <span style="font-weight: bold;">${details.matchedCommand}</span></div>
    <div class="output-container" style="display: flex;">`;

  if (details.output.command) {
    outputString += `<div class="output-command">Command <span class="command-label">${details.output.command}</span></div>`;
  }

  for (let i = 0; i < details.output.params.length; i++) {
    outputString += `<div class="output-parameter">${details.output.params[i].name} <span class="param-label ${details.output.type === 'number' ? 'param-number' : ''}">${details.output.params[i].value}</span></div>`;
  }

  outputString += "</div></div>";

  const newEntry = document.createElement("div");
  newEntry.classList.add("log-entry");
  newEntry.innerHTML = outputString;

  commandLog.prepend(newEntry);
}

document.querySelectorAll('.accordion-button').forEach(button => {
  button.addEventListener('click', () => {
    const accordionContent = button.nextElementSibling;
    button.classList.toggle('active'); // Toggles the 'active' class on the button
    if (button.classList.contains('active')) {
      accordionContent.style.display = 'block';
    } else {
      accordionContent.style.display = 'none';
    }
  });
});

document.getElementById('exportWordDictBtn').addEventListener('click', exportWordDictionary);

document.getElementById('importWordDictBtn').addEventListener('click', () => {
  document.getElementById('wordDictFileInput').click(); // Trigger file input
});

document.getElementById('wordDictFileInput').addEventListener('change', importWordDictionary);

window.addEventListener("load", init, false);

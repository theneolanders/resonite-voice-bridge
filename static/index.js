let url = "ws://localhost:6789";
let output;
let micEnabled = false;
let recognition;
let websocket;
const toggleMicButton = document.getElementById('toggleMicBtn');
const langSelect = document.getElementById('languageSelect');
let selectedLanguage = 'en-US';
let transcript = '';
let manuallyCleared = false;
let clearedSection = '';
let debugModeEnabled = false;
const debugModeCheckbox = document.getElementById('debugModeCheckbox');
const confidenceThresholdContainer = document.getElementById('confidenceThresholdContainer');
const confidenceThresholdCheckbox = document.getElementById('confidenceThresholdCheckbox');
const confidenceThresholdInput = document.getElementById('confidenceThresholdInput');
let useConfidenceThreshold = false;
let confidenceThreshold = 0;


function init() {
  output = document.getElementById("output");
  websocket = new WebSocket(url);

  websocket.onopen = function (e) { onOpen(e); };
  websocket.onmessage = function (e) { onMessage(e); };
  websocket.onerror = function (e) { onError(e); };
  websocket.onclose = function (e) { onClose(e); };

  initializeRecognition();

  toggleMicButton.addEventListener('click', toggleMic);
  document.getElementById('languageSelect').addEventListener('change', changeLanguage);
  document.getElementById('clearBtn').addEventListener('click', clearTranscript);

  debugModeCheckbox.addEventListener('change', () => {
    debugModeEnabled = debugModeCheckbox.checked;
    document.getElementById("confidenceValue").style.display = debugModeEnabled ? "block" : "none";
    if (debugModeEnabled) websocket.send('[debugEnabled]');
    else websocket.send('[debugDisabled]');
  });

  confidenceThresholdCheckbox.addEventListener('change', () => {
    useConfidenceThreshold = confidenceThresholdCheckbox.checked;
    setUseConfidenceThreshold();
  });

  confidenceThresholdInput.addEventListener('input', () => {
    const prevValue = confidenceThreshold;
    if (prevValue === parseFloat(confidenceThresholdInput.value)) return;
    confidenceThreshold = parseFloat(confidenceThresholdInput.value);
    if (!isNaN(confidenceThreshold)) websocket.send('[setConfidence=' + confidenceThreshold + ']');
  });

  checkMicrophoneAccess();
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
}

function onSpeechRecognized(e) {
  const recognized = e.results[0][0];
  document.getElementById("confidenceScore").textContent = recognized.confidence.toFixed(2);
  if (useConfidenceThreshold && recognized.confidence < confidenceThreshold) return;
  if (recognized.transcript !== transcript && recognized.transcript.length > transcript.length) {
    if (manuallyCleared) {
      transcript = recognized.transcript.replace(clearedSection, '');
    } else transcript = recognized.transcript;
    document.getElementById("sttOutput").innerHTML = transcript;
    websocket.send(transcript);

    if (debugModeEnabled) websocket.send('[debugConfidence=' + recognized.confidence.toFixed(2) + ']');
  }
}

function onSpeechEnded() {
  if (micEnabled) recognition.start();
  transcript = '';
  clearedSection = '';
  manuallyCleared = false;
}

function onOpen(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: green;">Connected</span>';
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
  }
}

function setUseConfidenceThreshold() {
  confidenceThresholdCheckbox.checked = useConfidenceThreshold;
  document.getElementById("confidenceThresholdContainer").style.display = useConfidenceThreshold ? "block" : "none";
  document.getElementById("confidenceValue").style.display = useConfidenceThreshold ? "block" : "none";
  if (useConfidenceThreshold) websocket.send('[enableConfidenceThreshold]');
  else websocket.send('[disableConfidenceThreshold]');
}

function setDebugMode() {
  debugModeCheckbox.checked = debugModeEnabled;
  document.getElementById("confidenceValue").style.display = debugModeEnabled ? "block" : "none";
  if (debugModeEnabled) websocket.send('[debugEnabled]');
  else websocket.send('[debugDisabled]');
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
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">Disconnected</span>';
}

window.addEventListener("load", init, false);

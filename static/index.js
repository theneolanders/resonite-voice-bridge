var url = "ws://localhost:6789";
var output;
var micEnabled = false;
var recognition;
var websocket;
const toggleMicButton = document.getElementById('toggleMicBtn');

function init() {
  output = document.getElementById("output");
  websocket = new WebSocket(url);

  websocket.onopen = function (e) { onOpen(e); };
  websocket.onmessage = function (e) { onMessage(e); };
  websocket.onerror = function (e) { onError(e); };
  websocket.onclose = function (e) { onClose(e); };

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.interimResults = true;

  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

    document.getElementById("sttOutput").innerHTML = transcript;
    websocket.send(transcript);
  });

  recognition.addEventListener('end', () => {
    if (micEnabled) recognition.start();
  });

  toggleMicButton.addEventListener('click', toggleMic);

  checkMicrophoneAccess();
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

function toggleMic() {
  micEnabled = !micEnabled;
  updateMic();
}

function updateMic() {
  if (micEnabled) recognition.start();
  else recognition.stop();
  document.getElementById("micStatus").innerHTML = micEnabled ? '<span style="color: green;">Listening</span>' : '<span style="color: red;">Not Listening</span>';
  websocket.send(micEnabled ? "^enabled^" : "^disabled^");
}

function onOpen(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: green;">Connected</span>';
}

function onMessage(event) {
  if (event.data === "_toggle_") toggleMic();
  else if (event.data === "_enable_") {
    micEnabled = true;
    updateMic();
  } else if (event.data === "_disable_") {
    micEnabled = false;
    updateMic();
  }
}

function onError(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">ERROR: ' + event.data + '</span>';
}

function onClose(event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">Disconnected</span>';
}

window.addEventListener("load", init, false);

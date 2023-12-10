var url = "ws://localhost:6789";
var output;

function init () {
  output = document.getElementById ("output");

  websocket = new WebSocket (url);

  websocket.onopen = function (e) {
    onOpen (e);
  };

  websocket.onmessage = function (e) {
    onMessage (e);
  };

  websocket.onerror = function (e) {
    onError (e);
  };

  websocket.onclose = function (e) {
    onClose (e);
  };
}

function onOpen (event) {
  document.getElementById("websocketStatus").innerHTML = 'Connected';
}

function onMessage (event) {
  document.getElementById("websocketOutput").innerHTML = event.data;
}

function onError (event) {
  document.getElementById("websocketStatus").innerHTML = '<span style="color: red;">ERROR: ' + event.data + '</span>';
}

// function onClose (event) {
//   document.getElementById("websocketStatus").innerHTML = 'Disconnected';
// }

function send (message) {
  websocket.send (message);
}

window.addEventListener ("load", init, false);

var speech = true;
window.SpeechRecognition = window.SpeechRecognition
                || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')

    document.getElementById("sttOutput").innerHTML = transcript;
    websocket.send(transcript);
});

if (speech == true) {
    recognition.start();
    recognition.addEventListener('end', recognition.start);
}
# Resonite Voice Bridge

This application enables the use of Speech-To-Text in Resonite, by bridging Google Chrome's STT API with a Websocket server.

## Usage

Launch the server executable, then open http://localhost:5000/ in Google Chrome. Grant the microphone permission and test the interface by speaking. You should see page saying the websocket is connected and text appearing.

In Resonite, create a websocket connection to ws://localhost:6789/. Any speech the page detects will be sent to this websocket.

## How it works

Internally the script is hosting both a webserver for the interface, and a websocket server for Resonite to connect to.

The page you load uses Javascript to utilize Google's SpeechRecognition API via Chrome, and then sends that information to the websocket server.

The websocket server is configured to echo any message it receives back to all other connected clients.

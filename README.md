# Resonite Voice Bridge

This application enables the use of Speech-To-Text in Resonite, by bridging Google Chrome's STT API with a Websocket server.

## Usage

Launch the server executable, then open http://localhost:5000/ in Google Chrome. Grant the microphone permission and test the interface by speaking. You should see page saying the websocket is connected and text appearing.

In Resonite, create a websocket connection to ws://localhost:6789/. Any speech the page detects will be sent to this websocket.

## How it works

Internally the script is hosting both a webserver for the interface, and a websocket server for Resonite to connect to.

The page you load uses Javascript to utilize Google's SpeechRecognition API via Chrome, and then sends that information to the websocket server.

The websocket server is configured to echo any message it receives back to all other connected clients.

## Notes

The text from the speech recognition API is streamed in real-time, rather than waiting for a pause and then sending the entire captured string. Due to the way Google's speech recognition works this will result in excessive messages.

For example saying "This is a test" resulted in 6 messages sent to the websocket:

![image](https://github.com/theneolanders/resonite-voice-bridge/assets/3112763/b9a624f5-7987-40a2-a8ac-39531735ced6) 

If you're not getting speech transcription in the webpage, make sure Chrome is listening to the correct input device:

![image](https://github.com/theneolanders/resonite-voice-bridge/assets/3112763/25ea18ba-35d9-470a-b68e-68c06fc3983a)


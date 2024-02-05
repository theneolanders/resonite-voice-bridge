![logo(1)](https://github.com/theneolanders/resonite-voice-bridge/assets/3112763/ccd355ff-1566-4a7d-a32a-99839171f1bf)

# Resonite Voice Bridge

#### _Logo by DALL-E, edited by Zetaphor. Application written in collaboration with GPT-4_


This application enables the use of Speech-To-Text in Resonite, by bridging Google Chrome's STT API with a Websocket server.

This enables the creation of tools like real-time captioning, or voice controlled objects.

## Download

The latest version can be found on the [releases page](https://github.com/theneolanders/resonite-voice-bridge/releases).

## Running the server

Launch the server executable, then open http://localhost:5000/ in Google Chrome. Grant the microphone permission and test the interface by speaking. You should see page saying the microhone is listening, the websocket is connected, and your spoken text appearing.

In Resonite, use the Websocket Connect node to create a websocket connection to ws://localhost:6789. Any speech the page detects will be sent to this connection.

Use the Websocket Message Received node to receive real-time updates from the speech recognition.

# Documentation

## Usage

### TODO: Update this after 2.0 release

_**This page requires Google Chrome, as it uses the Web Speech API. Please note that the speech recognition API in use is provided by Google.**_

This page will broadcast any detected speech using a websocket at the following url: **ws://localhost:6789**

## How it works

Internally the script is hosting both a webserver for the interface and a websocket server for Resonite to connect to.

The page you load uses Javascript to utilize Google's SpeechRecognition API via Chrome, and then sends that information to the websocket server.

The websocket server is configured to echo any message it receives back to all other connected clients.

## Troubleshooting

The text from the speech recognition API is streamed in real-time, rather than waiting for a pause and then sending the entire captured string.

If you're not getting speech transcription in the webpage, make sure Chrome is listening to the correct input device by clicking the microphone icon in the address bar:

![image](https://github.com/theneolanders/resonite-voice-bridge/assets/3112763/25ea18ba-35d9-470a-b68e-68c06fc3983a)

Additionally try testing the Chrome speech API on a different site to verify it's working: https://mdn.github.io/dom-examples/web-speech-api/speech-color-changer/

## Building the executable

Install the pyinstaller package and then run it against server.py

`pip install pyinstaller && pyinstaller server.py`

Then copy the `static` and `templates` folders into the `_internal` folder in the `dist` output

# Disclaimer

This project is in no way affiliated with by Resonite or any member of its staff.

### TODO:

* Update readme screenshots
* Implement custom timeouts instead of relying on the end event

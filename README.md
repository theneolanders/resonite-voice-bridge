# Resonite Voice Bridge

This application enables the use of Speech-To-Text in Resonite, by bridging Google Chrome's STT API with a Websocket server.

This enables the creation of tools like real-time captioning, or voice controlled objects.

## Download

The latest version can be found on the [releases page](https://github.com/theneolanders/resonite-voice-bridge/releases).

## Usage

Launch the server executable, then open http://localhost:5000/ in Google Chrome. Grant the microphone permission and test the interface by speaking. You should see page saying the microhone is listening, the websocket is connected, and your spoken text appearing.

In Resonite, use the Websocket Connect node to create a websocket connection to ws://localhost:6789. Any speech the page detects will be sent to this connection.

Use the Websocket Message Received node to receive real-time updates from the speech recognition.

## Commands and Events

The application supports commands and events to toggle and monitor the state of the microphone.

It is advised to disable the microphone access when not actively in use, as anything you say while the page is open and the microphone is active is being sent to Google's servers.

Note that the microphone controls for this application are separate from Resonite. You can have your Resonite mic open and the application muted, or vice-versa.

You can send the following commands to the websocket connection to control the microphone state:

* **toggle** - Toggles the microphone on and off
* **enable** - Enables the microphone
* **disable** - Disables the microphone
* **clear** - Forcibly clears the transcript (This can be finicky to the way Google changes predictions once it's more confident)
* **debugEnable** - Enables debug mode, this will trigger the display of the recognition confidence as well as debugConfidence events, see below for more information.
* **debugDisable** - Disables debug mode
* **lang=language-code** - Changes the language. Example: lang=en-US. Supports the following language codes:
    * en-US - English (United States)
    * en-GB - English (United Kingdom)
    * es-ES - Spanish (Spain)
    * es-MX - Spanish (Mexico)
    * fr-FR - French (France)
    * de-DE - German (Germany)
    * it-IT - Italian (Italy)
    * pt-PT - Portuguese (Portugal)
    * pt-BR - Portuguese (Brazil)
    * ru-RU - Russian (Russia)
    * zh-CN - Chinese (Simplified, China)
    * zh-TW - Chinese (Traditional, Taiwan)
    * ja-JP - Japanese (Japan)
    * ko-KR - Korean (South Korea)
    * ar-SA - Arabic (Saudi Arabia)
    * hi-IN - Hindi (India)

You can add new languages by modifying the JS and HTML files located in `_internal/static` and `_internal/templates`. Any BCP 47 lanuage tag Google supports should work.

The server will send the following event messages when the microphone status changes:

* **[enabled]** - The microphone has been enabled
* **[disabled]** - The microhone has been disabled
* **[cleared]** - The transcript has been manually cleared
* **[lang=language-code]** - The language has been changed to `language-code`. Example: [lang=en-US]
* **[debugEnabled]** - Debug mode has been enabled
* **[debugDisabled]** - Debug mode has been disabled
* **[debugConfidence=confidenceValue]** - When debug mode is enabled, this event will be sent in addition to each recognition message with the recognition confidence for that message. Example: [debugConfidence=0.929158627986908]

Note the `[` `]` and `_` characters in the events to simplify Protoflux parsing.

## How it works

Internally the script is hosting both a webserver for the interface and a websocket server for Resonite to connect to.

The page you load uses Javascript to utilize Google's SpeechRecognition API via Chrome, and then sends that information to the websocket server.

The websocket server is configured to echo any message it receives back to all other connected clients.

## Troubleshooting

The text from the speech recognition API is streamed in real-time, rather than waiting for a pause and then sending the entire captured string. Due to the way Google's speech recognition works this will result in excessive messages.

For example saying "This is a test" resulted in 6 messages sent to the websocket:

![image](https://github.com/theneolanders/resonite-voice-bridge/assets/3112763/b9a624f5-7987-40a2-a8ac-39531735ced6)

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

* Implement custom confidence thresholds
* Implement custom timeouts instead of relying on the end event
Library to broadcast the sound from the microphone through a WebSocket
Here I am figuring out how :
This library can work in two ways:

Streamer mode:

Get user audio from microphone (getUserMedia support require)
Encode it with Opus codec
Send it to websocket server
Works fine in Chrome, Firefox, Edge. Doesn't work in Safari.

Player mode:

Get packet from broadcasting server
Decode it with Opus codec
Write it to audio queue
Play audio queue (Web Audio Api support require)
Works fine in all browsers

For Speaker only: In Chrome browser you should use secure connection cause Chrome does not support getUserMedia in unsecure HTTP connection
How to setup secure HTTP server

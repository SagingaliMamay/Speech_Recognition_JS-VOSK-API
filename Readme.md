###VOSK API 
https://media.discordapp.net/attachments/870246639565148190/875329685930795058/unknown.png?width=1440&height=581
Library to broadcast the sound from the microphone through a WebSocket
Here I am figuring out how :
- WebSocket send data in two direction by same channel: Clent <--> Server
- How get access to microphone in browser
- How run this App in differents browsers
- What happening with data
- ![alt](https://media.discordapp.net/attachments/870246639565148190/875329685930795058/unknown.png?width=1440&height=581)

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

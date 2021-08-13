const https = require('http');
const fs = require("fs");
const WebSocketServer = require('ws').Server;
const wsPort = 8080;
const httpsServer = https.createServer({
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8')
}).listen(wsPort);

const wss = new WebSocketServer({
    server: httpsServer
});

const vosk = require('vosk');
vosk.setLogLevel(-1);
// MODELS: https://alphacephei.com/vosk/models
const model = new vosk.Model('vosk-model-en');
const rec = new vosk.Recognizer({
    model: model,
    sampleRate: 24000
});
vosk._rec_ = rec;
//let ret = vosk._rec_.result().text;
//console.log(ret);

// dev reference: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js


wss.on('connection', function(ws, req) {
    let connectionId = req.headers['sec-websocket-key'];

    ws.on('message', function(message) {
        console.log(message)
        const { OpusEncoder } = require('../../src/opus');

// Create the encoder.
// Specify 48kHz sampling rate and 2 channel size.
        const encoder = new OpusEncoder(24000, 1);

// Encode and decode.
        const encoded = encoder.encode('message');
        const decoded = encoder.decode(encoded);

// Encode and decode.

        // send data to --> Vosk API //Google Speech API // CommonVoice // ...
        vosk._rec_.acceptWaveform(message);
        let ret = vosk._rec_.result().text;
        console.log('vosk:', 'message')

    });
    console.log('Speaker connected');


});

wss.on('close', function() {

    console.log('Speaker disconnected');

});


console.log('Listening on port:', wsPort);
const https = require('http');
const fs = require("fs");
const WebSocketServer = require('ws').Server;
// Create the encoder.
// Specify 24kHz sampling rate and 1 channel size.
const { OpusEncoder } = require('@discordjs/opus');
const encoder = new OpusEncoder(24000, 1);

const wsPort = 8080;

const httpsServer = https.createServer({
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8')
}).listen(wsPort);

const wss = new WebSocketServer({ server: httpsServer });

const vosk = require('vosk');
vosk.setLogLevel(-1);
// MODELS: https://alphacephei.com/vosk/models
const model = new vosk.Model('sample/vosk-model-en');
const rec = new vosk.Recognizer({model: model, sampleRate: 24000});
vosk._rec_ = rec;
// dev reference: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js


wss.on('connection', function(ws, req) {
    ws.on('message', function(message) {
        //5 : message == opus encoded data
        //console.log(message)

        //6 : decode data --> raw audio data
        let raw_data = encoder.decode(message);

        //7 : send raw audio data to VOSK API
        if (vosk._rec_.acceptWaveform(raw_data))
            console.log(vosk._rec_.result()); //8: output
    });
    console.log('Speaker connected');
});

wss.on('close', function() {
    console.log('Speaker disconnected');
});

console.log('Listening on port:', wsPort);
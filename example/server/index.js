const https = require('http');
const fs = require("fs");//?
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
vosk.setLogLevel(-1);//?
// MODELS: https://alphacephei.com/vosk/models
const recs = {
    en : new vosk.Recognizer({model: new vosk.Model('sample/vosk-model-en'), sampleRate: 24000}),
    fr : new vosk.Recognizer({model: new vosk.Model('sample/vosk-model-fr'), sampleRate: 24000}),
}

wss.on('connection', function(ws, req) {
    let active_rec = recs.fr;//depending on your active language
    ws.on('message', function(message) {
        //5 : message == opus encoded data
        if (typeof message === "object") {
            //6 : decode data --> raw audio data
            let raw_data = encoder.decode(message);

            //7 : send raw audio data to VOSK API
            if (active_rec.acceptWaveform(raw_data)) {
                const txt = active_rec.result().text;
                ws.send(txt);//8: output

                // change & test:
                // todo : if changed by voice then update UI box
                if (txt == "change English") {
                    active_rec = recs.en;
                }
                else if (txt == "change French") {
                    active_rec = recs.fr;
                }
            }
        } else {
            console.log(message)
            if (message.includes('changeLang')) {
                let idx = message.split(':')[1]
                active_rec = recs[idx]
                console.log('new active rec: ', idx)
            }
        }
    });
    console.log('Speaker connected');
});

wss.on('close', function() {
    console.log('Speaker disconnected');
});

console.log('Listening on port:', wsPort);

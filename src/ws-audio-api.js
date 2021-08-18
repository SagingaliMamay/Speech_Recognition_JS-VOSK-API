
(function(global) {
	let defaultConfig = {
		codec: {
			sampleRate: 24000,
			channels: 1,
			app: 2048,
			frameDuration: 20,
			bufferSize: 4096
		},
		server: {
			host: window.location.hostname
		}
	};



	let WSAudioAPI = global.WSAudioAPI = {
		Streamer: function(config, socket) {
			//1 : get microphone access
			navigator.getUserMedia = (navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);

			this.config = config || {};
			this.config.codec = this.config.codec || defaultConfig.codec;
			this.config.server = this.config.server || defaultConfig.server;
			this.sampler = new Resampler(audioContext.sampleRate, this.config.codec.sampleRate, 1, this.config.codec.bufferSize);
			this.parentSocket = socket;
			this.encoder = new OpusEncoder(this.config.codec.sampleRate, this.config.codec.channels, this.config.codec.app, this.config.codec.frameDuration);
			let _this = this;

			this._makeStream = function(onError) {
				navigator.getUserMedia({
					audio: true
				}, function(stream) {
					_this.stream = stream;
					_this.audioInput = audioContext.createMediaStreamSource(stream);
					_this.gainNode = audioContext.createGain();
					_this.recorder = audioContext.createScriptProcessor(_this.config.codec.bufferSize, 1, 1);

					_this.recorder.onaudioprocess = function(e) {
						//2 : e.InputBuffer == raw audio data
						let resampled = _this.sampler.resampler(e.inputBuffer.getChannelData(0));

						//3 : raw audio --> opus encoded data
						let packets = _this.encoder.encode_float(resampled);
						for (let i = 0; i < packets.length; i++) {
							//4 : send data over socket
							if (_this.socket.readyState == 1) _this.socket.send(packets[i]);
						}
					};

					_this.audioInput.connect(_this.gainNode);
					_this.gainNode.connect(_this.recorder);
					_this.recorder.connect(audioContext.destination);
				}, onError || _this.onError);
			}
		}
	};

	WSAudioAPI.Streamer.prototype.start = function(onError) {
		let _this = this;
		console.log(this.config)
		if (!this.parentSocket) {
			this.socket = new WebSocket(this.config.server.host);
		} else {
			this.socket = this.parentSocket;
		}

		this.socket.binaryType = 'arraybuffer';

		if (this.socket.readyState == WebSocket.OPEN) {
			this._makeStream(onError);
		} else if (this.socket.readyState == WebSocket.CONNECTING) {
			let _onopen = this.socket.onopen;

			this.socket.onopen = function() {
				if (_onopen) {
					_onopen();
				}
				_this._makeStream(onError);
			}
		} else {
			console.error('Socket is in CLOSED state');
		}

		let _onclose = this.socket.onclose;

		//we receive the message from the server
		this.socket.onmessage = function(message) {
			console.log(message);

			const output = document.querySelector('.output');

			if(message){
				output.innerHTML = message.data;
			}
		};

		this.socket.onclose = function(event) {
			if (_onclose) {
				_onclose(event);
			}
			if (_this.audioInput) {
				_this.audioInput.disconnect();
				_this.audioInput = null;
			}
			if (_this.gainNode) {
				_this.gainNode.disconnect();
				_this.gainNode = null;
			}
			if (_this.recorder) {
				_this.recorder.disconnect();
				_this.recorder = null;
			}
			if (_this.stream)
				_this.stream.getTracks()[0].stop();
			console.log('Disconnected from server', event.reason);
		};
	};

	WSAudioAPI.Streamer.prototype.onError = function(e) {
		let error = new Error(e.name);
		error.name = 'NavigatorUserMediaError';
		throw error;
	};

	WSAudioAPI.Streamer.prototype.stop = function() {
		if (this.audioInput) {
			this.audioInput.disconnect();
			this.audioInput = null;
		}
		if (this.gainNode) {
			this.gainNode.disconnect();
			this.gainNode = null;
		}
		if (this.recorder) {
			this.recorder.disconnect();
			this.recorder = null;
		}
		this.stream.getTracks()[0].stop()

		if (!this.parentSocket) {
			this.socket.close();
		}
	};
})(window);
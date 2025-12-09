const statusEl = document.getElementById('status');
const statusText = document.getElementById('statusText');
const toggleBtn = document.getElementById('toggle');
const clearBtn = document.getElementById('clear');
const transcriptEl = document.getElementById('transcript');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isListening = false;
let finalTranscript = '';
let pauseTimer = null;
let lastSpoken = '';
let recognizing = false;
let starting = false;
let startTimer = null;

const updateStatus = (state, label) => {
	statusEl.dataset.state = state;
	statusText.textContent = label;
	toggleBtn.textContent = state === 'listening' ? '録音を停止' : '録音を開始';
};

const renderTranscript = (finalText, interimText) => {
	const text = [finalText, interimText].filter(Boolean).join(' ').trim();
	if (!text) {
		transcriptEl.innerHTML = '<span class="ghost">まだ発話がありません。</span>';
		return;
	}
	transcriptEl.textContent = text;
};

const handleSilence = () => {
	if (!finalTranscript.trim()) return;
	if (finalTranscript.trim() === lastSpoken.trim()) return;
	speakText(finalTranscript.trim());
};

const scheduleStart = (delay = 220) => {
	if (startTimer) clearTimeout(startTimer);
	startTimer = setTimeout(() => {
		if (isListening) safeStartRecognition();
	}, delay);
};

const resetPauseTimer = () => {
	if (pauseTimer) clearTimeout(pauseTimer);
	pauseTimer = setTimeout(handleSilence, 2000);
};

const initRecognition = () => {
	if (!SpeechRecognition) {
		updateStatus('idle', 'このブラウザは音声認識に対応していません');
		toggleBtn.disabled = true;
		return;
	}

	recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.lang = 'en-US';

	recognition.onresult = (event) => {
		let interim = '';
		// Only process new results to avoid re-parsing the full history.
		for (let i = event.resultIndex; i < event.results.length; i += 1) {
			const result = event.results[i];
			if (result.isFinal) {
				finalTranscript += result[0].transcript;
			} else {
				interim += result[0].transcript;
			}
		}

		renderTranscript(finalTranscript, interim);
		resetPauseTimer();
	};

	recognition.onstart = () => {
		recognizing = true;
		starting = false;
		updateStatus('listening', '認識中...');
	};

	recognition.onend = () => {
		recognizing = false;
		starting = false;
		if (isListening) {
			// Small delay to avoid InvalidStateError loops.
			scheduleStart(180);
		} else {
			updateStatus('idle', '待機中');
		}
	};

	recognition.onerror = (event) => {
		// Handle common transient errors without tearing down listening.
		if (event.error === 'no-speech') {
			updateStatus('listening', '音声が検出できませんでした。もう一度話してください');
			recognizing = false;
			starting = false;
			scheduleStart(300);
			return;
		}

		if (event.error === 'aborted') {
			// Ignore manual stop.
			return;
		}

		if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
			updateStatus('idle', 'マイク権限を許可してください');
			isListening = false;
			toggleBtn.disabled = true;
			return;
		}

		if (event.error === 'audio-capture') {
			updateStatus('idle', 'マイクが見つかりません');
			isListening = false;
			return;
		}

		console.error('Speech recognition error:', event.error);
		updateStatus('idle', 'エラーが発生しました');
		isListening = false;
	};
};

const safeStartRecognition = () => {
	if (!recognition) return;
	if (!isListening) return;
	if (recognizing || starting) return;
	starting = true;
	try {
		recognition.start();
	} catch (err) {
		starting = false;
		// InvalidStateError can happen if start is called too quickly; defer once.
		if (err.name === 'InvalidStateError') {
			setTimeout(() => {
				if (!recognizing && isListening) safeStartRecognition();
			}, 250);
		} else {
			console.error('Failed to start recognition:', err);
		}
	}
};

const speakText = (text) => {
	if (!text) return;
	if (!('speechSynthesis' in window)) return;

	window.speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'en-US';
	utterance.rate = 1;
	utterance.pitch = 1;
	utterance.volume = 1;
	utterance.onend = () => {
		lastSpoken = text;
	};

	window.speechSynthesis.speak(utterance);
};

const startListening = () => {
	if (!recognition) return;
	if (isListening) return;
	isListening = true;
	finalTranscript = '';
	lastSpoken = '';
	safeStartRecognition();
	updateStatus('listening', '認識中...');
};

const stopListening = () => {
	if (!recognition) return;
	if (!isListening) return;
	isListening = false;
	recognition.stop();
	updateStatus('idle', '待機中');
	if (pauseTimer) clearTimeout(pauseTimer);
	recognizing = false;
	starting = false;
};

toggleBtn.addEventListener('click', () => {
	if (isListening) {
		stopListening();
	} else {
		startListening();
	}
});

clearBtn.addEventListener('click', () => {
	finalTranscript = '';
	lastSpoken = '';
	renderTranscript('', '');
});

initRecognition();

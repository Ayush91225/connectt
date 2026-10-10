// Closed Captions (Live Speech Recognition + Peer Simulation)

export class CaptionSystem {
  constructor() {
    this.isActive = false;
    this.recognition = null;
    this.currentCaptions = [];
    this.listeners = [];
    this.simInterval = null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const text = finalTranscript || interimTranscript;
          if (text.trim()) {
            this.pushCaption('Ayushmaan Soni', text.trim(), true);
          }
        };

        this.recognition.onerror = (err) => {
          console.warn('Speech recognition error or unsupported in environment:', err);
        };
      } catch (e) {
        console.warn('Speech recognition init failed:', e);
      }
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.currentCaptions, this.isActive));
  }

  toggle(participantsGetter) {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.start(participantsGetter);
    } else {
      this.stop();
    }
    this.notify();
    return this.isActive;
  }

  start(participantsGetter) {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // already started or unavailable
      }
    }

    // Start simulated peer captions when active
    this.simInterval = setInterval(() => {
      if (!this.isActive) return;
      const peers = participantsGetter ? participantsGetter().filter(p => !p.isSelf && !p.isMuted) : [];
      if (peers.length > 0 && Math.random() < 0.4) {
        const peer = peers[Math.floor(Math.random() * peers.length)];
        const phrases = [
          "Let's make sure the audio and screen share are working properly.",
          "I think this architecture is very scalable.",
          "Can everyone see the updated slides?",
          "That aligns with our quarterly objectives.",
          "eps-kziz-mfv link is open to the entire engineering org."
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.pushCaption(peer.name, phrase, false);
      }
    }, 5000);
  }

  stop() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.currentCaptions = [];
    this.notify();
  }

  pushCaption(speaker, text, isSelf = false) {
    this.currentCaptions = [{ speaker, text, timestamp: Date.now() }];
    this.notify();

    // Auto clear after 4.5s
    setTimeout(() => {
      this.currentCaptions = this.currentCaptions.filter(c => Date.now() - c.timestamp < 4500);
      this.notify();
    }, 4500);
  }
}

export const captions = new CaptionSystem();

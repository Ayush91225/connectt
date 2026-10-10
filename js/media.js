// WebRTC Media Management, Audio Analysis, and Device Controls

class MediaManager {
  constructor() {
    this.localStream = null;
    this.screenStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.volumeCheckInterval = null;
    this.currentVolume = 0;
    this.onVolumeChange = null;
    this.isMicOn = true;
    this.isCameraOn = true;
    this.activeEffect = 'none'; // 'none', 'blur-light', 'blur-heavy', 'virtual-office', 'virtual-bookshelf'
    this.hasRealMedia = false;
  }

  async initMedia(video = true, audio = true) {
    try {
      if (this.localStream) {
        this.stopAll();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      this.localStream = stream;
      this.hasRealMedia = true;
      this.setCameraEnabled(video);
      this.setMicEnabled(audio);
      this.setupAudioAnalysis();
      return { success: true, stream: this.localStream };
    } catch (err) {
      console.warn('Could not acquire real camera/mic (permissions or device missing). Using simulated stream.', err);
      this.hasRealMedia = false;
      this.isMicOn = audio;
      this.isCameraOn = video;
      this.startSimulatedAudioAnalysis();
      return { success: false, error: err };
    }
  }

  setupAudioAnalysis() {
    try {
      if (!this.localStream) return;
      const audioTracks = this.localStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.4;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      if (this.volumeCheckInterval) clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = setInterval(() => {
        if (!this.isMicOn || !this.analyser) {
          this.currentVolume = 0;
          if (this.onVolumeChange) this.onVolumeChange(0);
          return;
        }

        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += this.dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        this.currentVolume = normalized;
        if (this.onVolumeChange) {
          this.onVolumeChange(normalized);
        }
      }, 70);
    } catch (e) {
      console.warn('Audio analysis setup error:', e);
    }
  }

  startSimulatedAudioAnalysis() {
    if (this.volumeCheckInterval) clearInterval(this.volumeCheckInterval);
    // Periodically simulate subtle voice fluctuation if unmuted
    this.volumeCheckInterval = setInterval(() => {
      if (!this.isMicOn) {
        this.currentVolume = 0;
        if (this.onVolumeChange) this.onVolumeChange(0);
        return;
      }
      // occasional speaking pulse
      const now = Date.now();
      const isSpeaking = (Math.sin(now / 1500) > 0.4);
      const volume = isSpeaking ? Math.floor(35 + Math.random() * 45) : Math.floor(Math.random() * 10);
      this.currentVolume = volume;
      if (this.onVolumeChange) this.onVolumeChange(volume);
    }, 100);
  }

  setMicEnabled(enabled) {
    this.isMicOn = enabled;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
    if (!enabled && this.onVolumeChange) {
      this.onVolumeChange(0);
    }
    return this.isMicOn;
  }

  toggleMic() {
    return this.setMicEnabled(!this.isMicOn);
  }

  setCameraEnabled(enabled) {
    this.isCameraOn = enabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
    return this.isCameraOn;
  }

  toggleCamera() {
    return this.setCameraEnabled(!this.isCameraOn);
  }

  async startScreenShare() {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      this.screenStream = displayStream;
      displayStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
      return { success: true, stream: this.screenStream };
    } catch (err) {
      console.warn('Could not share screen:', err);
      return { success: false, error: err };
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
  }

  setEffect(effectName) {
    this.activeEffect = effectName;
  }

  stopAll() {
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
  }

  async getDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { audioInputs: [], audioOutputs: [], videoInputs: [] };
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter(d => d.kind === 'audioinput'),
        audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
        videoInputs: devices.filter(d => d.kind === 'videoinput')
      };
    } catch (e) {
      return { audioInputs: [], audioOutputs: [], videoInputs: [] };
    }
  }
}

export const media = new MediaManager();

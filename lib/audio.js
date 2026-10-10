// High-Fidelity Synthesized Google Meet Audio Chimes via Harmonic Web Audio API

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Authentic Google Meet Entrance Bell (Warm two-chord marimba chime)
  playJoin() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chords = [
      { freqs: [523.25, 1046.5], time: 0, dur: 0.45 },     // C5
      { freqs: [659.25, 1318.5], time: 0.14, dur: 0.55 },   // E5
      { freqs: [783.99, 1567.98], time: 0.28, dur: 0.75 }  // G5
    ];

    chords.forEach(({ freqs, time, dur }) => {
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now + time);

        const vol = i === 0 ? 0.16 : 0.04;
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(vol, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    });
  }

  // Google Meet Departure Chime
  playLeave() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { freq: 783.99, time: 0 },
      { freq: 587.33, time: 0.12 },
      { freq: 440.00, time: 0.24 }
    ];

    notes.forEach(({ freq, time }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.14, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + 0.42);
    });
  }

  // Google Meet Hand Raise Bell (Crisp, polite attention chime)
  playHandRaise() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0, dur: 0.35 },    // D5
      { freq: 880.00, time: 0.12, dur: 0.6 }   // A5
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  // Tactile Soft Toggle Switch
  playToggle(state) {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(state ? 520 : 360, now);
      osc.frequency.exponentialRampToValueAtTime(state ? 720 : 240, now + 0.07);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Emoji Reaction Pop
  playReaction() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  // Authentic Digital Timer Alarm (Repeating twin beeps with dismiss/stop control)
  startAlarm() {
    this.stopAlarm();
    this.init();
    if (!this.ctx) return;

    this.alarmActive = true;
    let cycle = 0;

    const beepCycle = () => {
      if (!this.alarmActive || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Twin pulses: 0s and 0.14s
      [0, 0.14].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now + offset); // B5 crisp alarm note
        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.24, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });

      cycle++;
      if (cycle < 20 && this.alarmActive) {
        this.alarmTimer = setTimeout(beepCycle, 650);
      } else {
        this.alarmActive = false;
      }
    };

    beepCycle();
  }

  stopAlarm() {
    this.alarmActive = false;
    if (this.alarmTimer) {
      clearTimeout(this.alarmTimer);
      this.alarmTimer = null;
    }
  }
}

export const sfx = new SoundEffectsManager();

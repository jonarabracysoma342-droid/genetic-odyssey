// Dual Native MP3 Sound Engine for Genetic Odyssey
// Tracks: "Spring In My Step - Silent Partner" & "TheFatRat - Monody"

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.isBgmPlaying = false;
    this.bgmAudio = null;
    this.currentTrackId = localStorage.getItem('genetic_odyssey_bgm_track') || 'spring_in_my_step';
  }

  getTrackPath(trackId) {
    if (trackId === 'monody') {
      return '/audio/thefatrat_monody.mp3';
    }
    return '/audio/spring_in_my_step_official.mp3';
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(this.getTrackPath(this.currentTrackId));
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.15;
    }
  }

  // =================== SFX EFFECTS ===================
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playFanfare() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.4);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playBirdChirp() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const startTime = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, startTime);
      osc.frequency.exponentialRampToValueAtTime(3800, startTime + 0.06);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.015, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.06);
    } catch (e) {
      console.warn("Chirp play error", e);
    }
  }

  // =================== NATIVE BGM SYSTEM ===================
  toggleBgm() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.musicEnabled;
  }

  changeTrack(trackId) {
    this.currentTrackId = trackId;
    localStorage.setItem('genetic_odyssey_bgm_track', trackId);

    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.bgmAudio = new Audio(this.getTrackPath(trackId));
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.15;

    if (this.musicEnabled) {
      this.startBgm();
    }
  }

  startBgm() {
    this.musicEnabled = true;
    this.init();
    this.isBgmPlaying = true;

    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.15;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("BGM play prevented by browser autoplay policy. Waiting for user interaction:", err);
        });
      }
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }
}

export const sound = new SoundService();

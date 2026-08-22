// Dual Native MP3 Sound Engine for Genetic Odyssey
// Tracks: "Spring In My Step - Silent Partner" & "TheFatRat - Monody"

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.isBgmPlaying = false;
    this.bgmAudio = null;
    this.currentTrackId = localStorage.getItem('genetic_odyssey_bgm_track') || 'ambient_calm';
    this.synthInterval = null;
    this.synthOscillators = [];
  }

  getTrackPath(trackId) {
    if (trackId === 'monody') {
      return '/audio/thefatrat_monody.mp3';
    }
    if (trackId === 'ambient_calm') {
      return 'ambient_calm';
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

    if (!this.bgmAudio && this.currentTrackId !== 'ambient_calm') {
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
      this.bgmAudio = null;
    }
    this.stopSynthBgm();

    if (trackId !== 'ambient_calm') {
      this.bgmAudio = new Audio(this.getTrackPath(trackId));
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.15;
    }

    if (this.musicEnabled) {
      this.startBgm();
    }
  }

  startBgm() {
    this.musicEnabled = true;
    this.init();
    this.isBgmPlaying = true;

    if (this.currentTrackId === 'ambient_calm') {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
      this.startSynthBgm();
    } else {
      this.stopSynthBgm();
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
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.stopSynthBgm();
  }

  // =================== GENERATIVE SYNTH BGM ===================
  startSynthBgm() {
    this.stopSynthBgm();
    this.init();
    if (!this.audioCtx) return;

    try {
      // Warm Gain
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      // Warm lowpass filter (removes high harshness)
      this.synthFilter = this.audioCtx.createBiquadFilter();
      this.synthFilter.type = 'lowpass';
      this.synthFilter.frequency.setValueAtTime(650, this.audioCtx.currentTime);

      // Spooky / Calm spacious delay
      this.synthDelay = this.audioCtx.createDelay(2.0);
      this.synthDelay.delayTime.setValueAtTime(0.8, this.audioCtx.currentTime);

      this.synthDelayGain = this.audioCtx.createGain();
      this.synthDelayGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

      // Connect nodes
      this.synthGain.connect(this.synthFilter);
      this.synthFilter.connect(this.audioCtx.destination);

      // Echo feedback routing
      this.synthGain.connect(this.synthDelay);
      this.synthDelay.connect(this.synthDelayGain);
      this.synthDelayGain.connect(this.synthDelay);
      this.synthDelayGain.connect(this.synthFilter);

      const baseScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const pads = [
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [110.00, 146.83, 164.81, 196.00], // Am9
        [164.81, 196.00, 246.94, 293.66]  // Em7
      ];

      let step = 0;
      
      const playStep = () => {
        if (!this.audioCtx || this.audioCtx.state === 'closed' || !this.isBgmPlaying) return;
        const now = this.audioCtx.currentTime;

        // Play ambient pad chords every 8 seconds
        if (step % 2 === 0) {
          const chord = pads[Math.floor(step / 2) % pads.length];
          chord.forEach(freq => {
            try {
              const osc = this.audioCtx.createOscillator();
              const noteGain = this.audioCtx.createGain();

              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now);

              noteGain.gain.setValueAtTime(0, now);
              noteGain.gain.linearRampToValueAtTime(0.015, now + 3.0);
              noteGain.gain.setValueAtTime(0.015, now + 5.0);
              noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.0);

              osc.connect(noteGain);
              noteGain.connect(this.synthGain);

              osc.start(now);
              osc.stop(now + 8.0);

              this.synthOscillators.push(osc);
              setTimeout(() => {
                this.synthOscillators = this.synthOscillators.filter(o => o !== osc);
              }, 9000);
            } catch (e) {}
          });
        }

        // Play gentle bell sound every 4 seconds
        try {
          const bellFreq = baseScale[Math.floor(Math.random() * baseScale.length)] * 2;
          const bellOsc = this.audioCtx.createOscillator();
          const bellGain = this.audioCtx.createGain();

          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(bellFreq, now);

          bellGain.gain.setValueAtTime(0, now);
          bellGain.gain.linearRampToValueAtTime(0.02, now + 0.2);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          bellOsc.connect(bellGain);
          bellGain.connect(this.synthGain);

          bellOsc.start(now);
          bellOsc.stop(now + 4.0);

          this.synthOscillators.push(bellOsc);
          setTimeout(() => {
            this.synthOscillators = this.synthOscillators.filter(o => o !== bellOsc);
          }, 5000);
        } catch (e) {}

        step++;
      };

      playStep();
      this.synthInterval = setInterval(playStep, 4000);

    } catch (err) {
      console.warn("Synth BGM failed to start", err);
    }
  }

  stopSynthBgm() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.synthOscillators && this.synthOscillators.length > 0) {
      this.synthOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      this.synthOscillators = [];
    }
  }
}

export const sound = new SoundService();

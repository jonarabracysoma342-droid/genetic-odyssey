// Dual Native MP3 Sound Engine for Genetic Odyssey - Music disabled per user request

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.isBgmPlaying = false;
    this.bgmAudio = null;
    this.currentTrackId = 'none';
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

  // =================== FOOTSTEPS SFX ===================
  playFootstep(surface = 'grass') {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    if (this._lastFootstepTime && now - this._lastFootstepTime < 0.13) return;
    this._lastFootstepTime = now;

    try {
      if (surface === 'stone') {
        // === 1. BATU (STONE / COBBLESTONE / PAVEMENT) ===
        // Suara yang sebelumnya: Firm crisp stone tap + solid heel thud (tuk-tuk / tak-tak)
        const duration = 0.07;
        const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32));
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1050 + Math.random() * 200, now);
        filter.Q.setValueAtTime(1.5, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.28, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);

        // Audible solid heel thud on hard stone
        const thud = this.audioCtx.createOscillator();
        const thudGain = this.audioCtx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(120 + Math.random() * 20, now);
        thud.frequency.exponentialRampToValueAtTime(35, now + 0.06);

        thudGain.gain.setValueAtTime(0.32, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        thud.connect(thudGain);
        thudGain.connect(this.audioCtx.destination);

        noise.start(now);
        thud.start(now);
        thud.stop(now + 0.06);

      } else if (surface === 'wood') {
        // === 2. KAYU (WOODEN FLOORBOARDS - CABIN INTERIOR) ===
        // Resonansi lantai kayu hollow + thud hangat
        const duration = 0.08;
        const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(850 + Math.random() * 120, now);
        filter.Q.setValueAtTime(2.2, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.26, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);

        const thud = this.audioCtx.createOscillator();
        const thudGain = this.audioCtx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(160 + Math.random() * 20, now);
        thud.frequency.exponentialRampToValueAtTime(45, now + 0.07);

        thudGain.gain.setValueAtTime(0.28, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        thud.connect(thudGain);
        thudGain.connect(this.audioCtx.destination);

        noise.start(now);
        thud.start(now);
        thud.stop(now + 0.07);

      } else {
        // === 3. RUMPUT (GRASS / FOLIAGE / SOIL) ===
        // Suara khas menginjak rumput: gemersik dedaunan & helai rumput lembut (srek-srek / krusy-krusy)
        // Tanpa benturan keras batu, dengan tekstur brush mikro yang renyah dan empuk
        const duration = 0.095;
        const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const t = i / bufferSize;
          // Shimmer envelope simulating grass blades rustling under the sole
          const flutter = 1 + 0.3 * Math.sin(t * 80);
          const env = Math.sin(t * Math.PI) * Math.exp(-t * 2.2) * flutter;
          data[i] = (Math.random() * 2 - 1) * env;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass tuned to crisp plant foliage / grass blades (1300 - 1800Hz)
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1450 + Math.random() * 300, now);
        filter.Q.setValueAtTime(1.1, now);

        // Lowpass to give warm earthy body under the leaf rustle
        const lowFilter = this.audioCtx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.setValueAtTime(2900, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.32, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(lowFilter);
        lowFilter.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);

        // Soft muffled turf / damp soil compression (muffled low hum, NO hard click)
        const turf = this.audioCtx.createOscillator();
        const turfGain = this.audioCtx.createGain();
        turf.type = 'sine';
        turf.frequency.setValueAtTime(75 + Math.random() * 15, now);
        turf.frequency.exponentialRampToValueAtTime(28, now + 0.07);

        turfGain.gain.setValueAtTime(0.18, now);
        turfGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        turf.connect(turfGain);
        turfGain.connect(this.audioCtx.destination);

        noise.start(now);
        turf.start(now);
        turf.stop(now + 0.07);
      }
    } catch (e) {}
  }

  // =================== DIALOGUE TYPING BLIP (TRUT TRUT TRUT) ===================
  playDialogueBlip(speaker = 'npc') {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    if (this._lastBlipTime && now - this._lastBlipTime < 0.035) return;
    this._lastBlipTime = now;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Rounded warm vocal tone (trut-trut chatter, not clicky)
      osc.type = 'triangle';

      // Pitch variance around 420-540Hz for crystal clear friendly retro RPG chatter
      const jitter = (Math.random() - 0.5) * 70;
      const baseFreq = (speaker === 'player' ? 520 : 450) + jitter;

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + 0.042);

      // Lowpass filter ensures warm rounded tone without typewriter clickiness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.042);
    } catch (e) {}
  }

  // =================== AMBIENT NATURE SOUNDS ===================
  playBirdChirp() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const chirps = [
        { f1: 2600 + Math.random() * 200, f2: 4000 + Math.random() * 300, delay: 0, dur: 0.06 },
        { f1: 3400 + Math.random() * 200, f2: 4800 + Math.random() * 200, delay: 0.09, dur: 0.07 },
        { f1: 4400 + Math.random() * 200, f2: 3600 + Math.random() * 200, delay: 0.18, dur: 0.08 }
      ];

      const count = Math.random() > 0.35 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const c = chirps[i];
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        const start = now + c.delay;
        osc.frequency.setValueAtTime(c.f1, start);
        osc.frequency.exponentialRampToValueAtTime(c.f2, start + c.dur);

        gain.gain.setValueAtTime(0.005, start);
        gain.gain.linearRampToValueAtTime(0.24, start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.001, start + c.dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + c.dur);
      }
    } catch (e) {
      console.warn("Chirp play error", e);
    }
  }

  playWindRustle() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const duration = 2.6;
      const bufferSize = Math.floor(this.audioCtx.sampleRate * duration);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.32;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(800, now + duration * 0.5);
      filter.frequency.linearRampToValueAtTime(400, now + duration);
      filter.Q.setValueAtTime(1.3, now);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + duration * 0.4);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  playFountainWater(proximity = 1.0) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const vol = Math.min(1.0, Math.max(0, proximity)) * 0.25;
      if (vol <= 0.005) return;

      for (let i = 0; i < 4; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = now + i * 0.065 + Math.random() * 0.02;
        const baseFreq = 620 + Math.random() * 380;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, start + 0.05);

        gain.gain.setValueAtTime(vol * 0.8, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.05);
      }
    } catch (e) {}
  }

  // =================== NATIVE BGM SYSTEM ===================
  // =================== NATIVE BGM SYSTEM ===================
  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  isBgmActive() {
    return this.isBgmPlaying;
  }

  setBgmVolume(targetVolume = 0.50, duration = 300) {
    const target = Math.max(0, Math.min(1, targetVolume));
    if (!this.bgmAudio) return;

    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }

    if (duration <= 0) {
      this.bgmAudio.volume = target;
      return;
    }

    const start = this.bgmAudio.volume;
    const diff = target - start;
    const steps = 15;
    const interval = duration / steps;
    let step = 0;

    this.bgmFadeTimer = setInterval(() => {
      step++;
      const current = start + (diff * (step / steps));
      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.max(0, Math.min(1, current));
      }
      if (step >= steps) {
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
        if (this.bgmAudio) {
          this.bgmAudio.volume = target;
        }
      }
    }, interval);
  }

  // Audio Ducking: Kecilkan ke 30% saat ada suara bicara / dialog
  duckBgm() {
    this.setBgmVolume(0.30, 250);
  }

  // Audio Unducking: Kembalikan ke suara normal 50% saat dialog selesai
  unduckBgm() {
    this.setBgmVolume(0.50, 350);
  }

  startBgm() {
    this.musicEnabled = true;
    this.init();
    this.isBgmPlaying = true;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
    }
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.50; // Suara dasar 50%

    // Seamless loop fallback listener
    this.bgmAudio.onended = () => {
      if (this.musicEnabled && this.bgmAudio) {
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.play().catch(() => {});
      }
    };

    const candidateTracks = [
      '/audio/bgm/backsound.mp3?t=' + Date.now(),
      '/audio/bgm/backsound.mp3',
      '/audio/bgm/Mosslight Reverie.mp3',
      '/audio/bgm/backsound.ogg',
      '/audio/bgm/backsound.wav',
      '/audio/backsound.mp3',
      '/audio/backsound.ogg',
      '/audio/spring_in_my_step_official.mp3'
    ];
    let candidateIndex = 0;

    const playCandidate = () => {
      if (!this.musicEnabled || candidateIndex >= candidateTracks.length) return;
      const trackSrc = candidateTracks[candidateIndex];
      this.bgmAudio.src = trackSrc;
      this.bgmAudio.loop = true;

      this.bgmAudio.onerror = () => {
        candidateIndex++;
        playCandidate();
      };

      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isBgmPlaying = true;
          this.bgmAudio.volume = 0.50; // Pastikan suara dasar 50%
        }).catch((err) => {
          if (err.name === 'NotAllowedError') {
            const onUserGesture = () => {
              if (this.musicEnabled && this.bgmAudio) {
                this.bgmAudio.play().catch(() => {});
              }
              window.removeEventListener('pointerdown', onUserGesture);
              window.removeEventListener('keydown', onUserGesture);
            };
            window.addEventListener('pointerdown', onUserGesture, { once: true });
            window.addEventListener('keydown', onUserGesture, { once: true });
          } else {
            candidateIndex++;
            playCandidate();
          }
        });
      }
    };

    playCandidate();
  }

  stopBgm() {
    this.musicEnabled = false;
    this.isBgmPlaying = false;
    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }
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

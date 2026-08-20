/**
 * Sound Engine using Web Audio API
 * Synthesizes sound effects purely in code without needing external MP3 files.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.winchOsc = null;
        this.winchGain = null;
        this.winchLfo = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.winchGain && this.ctx) {
            this.winchGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        return this.muted;
    }

    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    startWinchSound() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        if (this.winchOsc) return; // already playing

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // Crane motor whirring + cable vibration
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime); // Low engine hum

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(15, this.ctx.currentTime); // 15Hz motor vibration
        lfoGain.gain.setValueAtTime(10, this.ctx.currentTime);

        lfo.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);

        // Lowpass filter for smooth machinery rumble
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();

        this.winchOsc = osc;
        this.winchGain = gain;
        this.winchLfo = lfo;
    }

    stopWinchSound() {
        if (this.winchGain && this.ctx) {
            this.winchGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
            setTimeout(() => {
                try {
                    if (this.winchOsc) {
                        this.winchOsc.stop();
                        this.winchOsc.disconnect();
                    }
                    if (this.winchLfo) {
                        this.winchLfo.stop();
                        this.winchLfo.disconnect();
                    }
                } catch (e) {}
                this.winchOsc = null;
                this.winchGain = null;
                this.winchLfo = null;
            }, 160);
        }
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.4);
        });
    }

    playFail() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [220, 196, 174.61, 146.83]; // A3, G3, F3, D3 descending buzzer

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0.18, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.18);

            // Filter out harsh highs
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, now + i * 0.1);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }

    playLevelComplete() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumphant chord
        chordNotes.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 1.2);
        });
    }
}

window.soundEngine = new SoundEngine();

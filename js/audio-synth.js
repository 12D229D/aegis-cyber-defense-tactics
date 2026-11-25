/**
 * ============================================================================
 * AEGIS PROTOCOL: Audio Synthesis Engine (Web Audio API)
 * Generador procedural de efectos tácticos de ciberdefensa sin dependencias.
 * ============================================================================
 */

export class CyberAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.35;
        this.ambientGain = null;
        this.ambientOsc = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    setMuted(muted) {
        this.isMuted = !!muted;
        if (this.ambientGain && this.ctx) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
        }
    }

    // Efecto sutil al interactuar con botones o seleccionar nodos
    playTacticalClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Pulso de escaneo forense (radar sonar futurista)
    playScanPulse() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Alerta de intrusión / exploit del Red Team (bocina cyberpunk discordante)
    playIntrusionAlert() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [0, 0.12].forEach((delay, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(idx === 0 ? 880 : 780, now + delay);
            osc.frequency.exponentialRampToValueAtTime(220, now + delay + 0.1);

            gain.gain.setValueAtTime(this.masterVolume * 0.6, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.1);
        });
    }

    // Aislamiento / Sandbox de nodo (efecto de corte de energía electroestático)
    playIsolateSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Despliegue de parche de seguridad o regla WAF (confirmación armónica ascendente)
    playPatchDeployed() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [440, 660, 880, 1100];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.15);
        });
    }

    // Despliegue de trampa Honeypot (chime digital hipnótico)
    playHoneypotTrap() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.25);
        });
    }

    // Fanfarria de victoria (Misión cumplida, infraestructura asegurada)
    playVictorySound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chords = [
            { f: 523.25, t: 0.0 },   // C5
            { f: 659.25, t: 0.12 },  // E5
            { f: 783.99, t: 0.24 },  // G5
            { f: 1046.50, t: 0.36 }, // C6
            { f: 1318.51, t: 0.50 }  // E6 sustain
        ];

        chords.forEach(c => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(c.f, now + c.t);

            gain.gain.setValueAtTime(this.masterVolume * 0.5, now + c.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + c.t + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + c.t);
            osc.stop(now + c.t + 0.6);
        });
    }

    // Sonido de derrota (Bóveda comprometida, caída de integridad crítica)
    playDefeatSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [
            { f: 330, t: 0.0 },
            { f: 311.13, t: 0.2 },
            { f: 293.66, t: 0.4 },
            { f: 220, t: 0.65 }
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, now + n.t);

            gain.gain.setValueAtTime(this.masterVolume * 0.6, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + n.t);
            osc.stop(now + n.t + 0.45);
        });
    }

    // Zumbido ambiental de servidor Sci-Fi (drone de baja frecuencia en bucle suave)
    startAmbientDrone() {
        if (this.ambientOsc || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(160, this.ctx.currentTime);

            gain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            this.ambientOsc = osc;
            this.ambientGain = gain;
        } catch (e) {
            console.warn('Ambient drone initialization deferred:', e);
        }
    }
}

export const audioSynth = new CyberAudioEngine();

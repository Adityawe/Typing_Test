// Web Audio API Mechanical Keyboard Sound Synthesizer
// Provides realistic mechanical switch clicks (Cherry MX style), spacebar thocks, backspaces, and error tones with zero latency and no external files.

let audioCtx = null;
const STORAGE_SOUND_KEY = 'keystroke_sound_enabled_v1';

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  try {
    const saved = localStorage.getItem(STORAGE_SOUND_KEY);
    // default to true
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_SOUND_KEY, String(enabled));
  } catch {}
  return enabled;
}

// Play standard key click (Cherry MX tactile switch click & thock)
export function playKeyClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Layer 1: High frequency click (Switch contact leaf)
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();

  clickOsc.type = 'triangle';
  // Slight pitch variation for natural typing sound
  const baseFreq = 800 + Math.random() * 200;
  clickOsc.frequency.setValueAtTime(baseFreq, now);
  clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.025);

  clickFilter.type = 'bandpass';
  clickFilter.frequency.setValueAtTime(2400, now);
  clickFilter.Q.setValueAtTime(2, now);

  clickGain.gain.setValueAtTime(0.12, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  clickOsc.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);

  clickOsc.start(now);
  clickOsc.stop(now + 0.025);

  // Layer 2: Low-end body (Keycap bottoming out on switch housing)
  const thockOsc = ctx.createOscillator();
  const thockGain = ctx.createGain();

  thockOsc.type = 'sine';
  const thockFreq = 160 + Math.random() * 25;
  thockOsc.frequency.setValueAtTime(thockFreq, now);
  thockOsc.frequency.exponentialRampToValueAtTime(60, now + 0.035);

  thockGain.gain.setValueAtTime(0.18, now);
  thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  thockOsc.connect(thockGain);
  thockGain.connect(ctx.destination);

  thockOsc.start(now);
  thockOsc.stop(now + 0.035);
}

// Play spacebar click (Deeper resonance and longer decay thock)
export function playSpacebarClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

// Play backspace click (Slightly lighter, higher pitch click)
export function playBackspaceClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}

// Play subtle error sound on wrong keypress
export function playErrorTone() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.linearRampToValueAtTime(90, now + 0.05);

  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

// Play brief celebratory chime when completing a test
export function playSuccessChime() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const now = ctx.currentTime + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  });
}

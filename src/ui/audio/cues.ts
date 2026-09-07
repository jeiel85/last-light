/**
 * Audio cues.
 *
 * Every sound is synthesised here — the project ships no audio files, and a survival game
 * whose interface beeps like a phone would undercut the whole atmosphere. The palette is
 * deliberately small and low: filtered square and triangle tones with short envelopes, the
 * sort of noise an old panel makes when it acknowledges an input.
 *
 * Sound is off by default and gated behind a user gesture, because browsers require one and
 * because a game that makes noise before being asked is a game people mute.
 */

export type CueName =
  | 'tick' // a control acknowledged
  | 'day' // the day turned over
  | 'event' // something needs answering
  | 'good' // an outcome went well
  | 'bad' // an outcome went badly
  | 'death' // somebody died
  | 'build' // construction or research finished
  | 'alarm'; // a resource ran out

interface CueSpec {
  /** Frequency steps, in Hz, played in sequence. */
  steps: number[];
  /** Seconds per step. */
  step: number;
  type: OscillatorType;
  gain: number;
  /** Low-pass cutoff, which is what keeps everything sounding like old equipment. */
  cutoff: number;
  /** Optional filtered noise burst under the tone, for texture. */
  noise?: number;
}

const CUES: Record<CueName, CueSpec> = {
  tick: { steps: [520], step: 0.035, type: 'square', gain: 0.05, cutoff: 1400 },
  day: { steps: [196, 262, 330], step: 0.11, type: 'triangle', gain: 0.1, cutoff: 1800 },
  event: { steps: [330, 247], step: 0.13, type: 'triangle', gain: 0.11, cutoff: 1500 },
  good: { steps: [392, 523], step: 0.09, type: 'triangle', gain: 0.1, cutoff: 2200 },
  bad: { steps: [220, 175], step: 0.12, type: 'square', gain: 0.09, cutoff: 900 },
  death: { steps: [147, 131, 98], step: 0.28, type: 'triangle', gain: 0.13, cutoff: 700 },
  build: { steps: [294, 392, 466], step: 0.08, type: 'triangle', gain: 0.09, cutoff: 2400 },
  alarm: { steps: [440, 349, 440, 349], step: 0.14, type: 'square', gain: 0.1, cutoff: 1100, noise: 0.02 },
};

let context: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let volume = 0.6;

/** Browsers only allow audio after a gesture, so the context is created on first use. */
function ensureContext(): AudioContext | null {
  if (context) return context;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
    master = context.createGain();
    master.gain.value = volume;
    master.connect(context.destination);
    return context;
  } catch {
    // A browser that refuses to give us audio is not an error worth surfacing.
    return null;
  }
}

export function setAudioEnabled(next: boolean): void {
  enabled = next;
  if (next) void ensureContext()?.resume();
}

export function setAudioVolume(next: number): void {
  volume = Math.max(0, Math.min(1, next));
  if (master) master.gain.value = volume;
}

function noiseBurst(ctx: AudioContext, at: number, seconds: number, level: number): void {
  const frames = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  const gain = ctx.createGain();
  gain.gain.value = level;
  source.connect(filter).connect(gain).connect(master!);
  source.start(at);
}

/** Play a cue. Silent and harmless when sound is off or unavailable. */
export function playCue(name: CueName): void {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx || !master) return;
  if (ctx.state === 'suspended') void ctx.resume();

  const spec = CUES[name];
  const now = ctx.currentTime + 0.005;

  spec.steps.forEach((frequency, index) => {
    const at = now + index * spec.step;
    const osc = ctx.createOscillator();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(frequency, at);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = spec.cutoff;

    const gain = ctx.createGain();
    // A short attack and an exponential tail: percussive, never a beep held too long.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(spec.gain, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + spec.step * 0.95);

    osc.connect(filter).connect(gain).connect(master!);
    osc.start(at);
    osc.stop(at + spec.step);
  });

  if (spec.noise) noiseBurst(ctx, now, spec.step * spec.steps.length, spec.noise);
}

/** Release the audio device. Called when sound is switched off. */
export function closeAudio(): void {
  if (!context) return;
  void context.close();
  context = null;
  master = null;
}

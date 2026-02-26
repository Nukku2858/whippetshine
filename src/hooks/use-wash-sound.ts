import { useRef, useCallback } from "react";

/**
 * Synthesized pressure-wash sound using Web Audio API.
 * Creates filtered white noise that sounds like a water spray.
 */
export const useWashSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startWash = useCallback((volume = 0.04) => {
    try {
      // Create or reuse AudioContext
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Stop previous sound if playing
      try { noiseRef.current?.stop(); } catch {}

      // Generate white noise buffer (2 seconds, loopable)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Bandpass filter to shape the noise into a "spray" sound
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 2200;
      bandpass.Q.value = 0.8;

      // Highpass to remove rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 500;

      // Gain for volume control and fade-in
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);

      source.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      noiseRef.current = source;
      gainRef.current = gain;

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    } catch {
      // Audio not supported, fail silently
    }
  }, []);

  const stopWash = useCallback((fadeDuration = 1.5) => {
    try {
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      const source = noiseRef.current;
      if (!ctx || !gain || !source) return;

      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeDuration);
      setTimeout(() => {
        try { source.stop(); } catch {}
        noiseRef.current = null;
        gainRef.current = null;
      }, fadeDuration * 1000 + 50);
    } catch {}
  }, []);

  const playSplat = useCallback(() => {
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Short burst of brown noise for a "splat" sound
      const duration = 0.15;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Brown noise with fast decay envelope
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        const envelope = 1 - i / bufferSize;
        data[i] = lastOut * 3.5 * envelope * envelope;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Lowpass for a muffled thud
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 400;
      lowpass.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.value = 0.06 + Math.random() * 0.03;

      source.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      // Haptic tap
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {}
  }, []);

  return { startWash, stopWash, playSplat };
};

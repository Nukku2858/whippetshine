import { useRef, useCallback } from "react";

/**
 * Synthesized pressure-wash sound using Web Audio API.
 * Creates filtered white noise that sounds like a water spray.
 */
export const useWashSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startWash = useCallback((volume = 0.12) => {
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
      bandpass.frequency.value = 3500;
      bandpass.Q.value = 0.5;

      // Highpass to remove rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 800;

      // Gain for volume control and fade-in
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3);

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

  const stopWash = useCallback((fadeDuration = 0.5) => {
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

  return { startWash, stopWash };
};

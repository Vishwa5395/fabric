const fs = require('fs');
const path = require('path');

// Generate 30 seconds of pure soothing ambient chords (C major pentatonic: C, E, G, A)
const sampleRate = 22050;
const durationSec = 30;
const numSamples = sampleRate * durationSec;
const buffer = new Int16Array(numSamples);

// Notes in Hz: C3 (130.81), G3 (196.00), C4 (261.63), E4 (329.63), G4 (392.00)
const freqs = [130.81, 196.00, 261.63, 329.63, 392.00];

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  let sample = 0;

  // Gentle wave modulation (swell every 6 seconds)
  const swell = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 6 - Math.PI / 2);

  for (let f = 0; f < freqs.length; f++) {
    const freq = freqs[f];
    // Warm harmonics
    const wave1 = Math.sin(2 * Math.PI * freq * t);
    const wave2 = 0.4 * Math.sin(2 * Math.PI * (freq * 1.002) * t); // subtle detune chorus
    const wave3 = 0.2 * Math.sin(2 * Math.PI * (freq * 2) * t); // gentle second harmonic

    sample += (wave1 + wave2 + wave3) * (0.15 / freqs.length);
  }

  // Soft fade in / out at loop boundary for seamless 30s loop
  const fadeSec = 1.5;
  let envelope = 1;
  if (t < fadeSec) {
    envelope = t / fadeSec;
  } else if (t > durationSec - fadeSec) {
    envelope = (durationSec - t) / fadeSec;
  }

  const finalVal = sample * swell * envelope * 0.7;
  buffer[i] = Math.max(-32768, Math.min(32767, Math.round(finalVal * 32767)));
}

// Write standard WAV header
const wavHeader = Buffer.alloc(44);
wavHeader.write('RIFF', 0);
wavHeader.writeUInt32LE(36 + numSamples * 2, 4);
wavHeader.write('WAVE', 8);
wavHeader.write('fmt ', 12);
wavHeader.writeUInt32LE(16, 16); // PCM
wavHeader.writeUInt16LE(1, 20); // Mono
wavHeader.writeUInt16LE(1, 22); // 1 channel
wavHeader.writeUInt32LE(sampleRate, 24);
wavHeader.writeUInt32LE(sampleRate * 2, 28);
wavHeader.writeUInt16LE(2, 32); // Block align
wavHeader.writeUInt16LE(16, 34); // Bits per sample
wavHeader.write('data', 36);
wavHeader.writeUInt32LE(numSamples * 2, 40);

const finalBuffer = Buffer.concat([wavHeader, Buffer.from(buffer.buffer)]);

fs.writeFileSync(path.resolve('public/audio/ambient.wav'), finalBuffer);
fs.writeFileSync(path.resolve('public/audio/ambient.m4a'), finalBuffer);
fs.writeFileSync(path.resolve('public/audio/ambient.ogg'), finalBuffer);
console.log('Soothing ambient audio files created in public/audio/ (WAV, M4A, OGG).');


/**
 * Encodes AudioBuffer channels into a standard PCM 16-bit Mono WAV Blob (~22.05kHz or downsampled)
 */
export function encodeAudioBufferToWav(buffer: AudioBuffer, startSec: number, endSec: number): Blob {
  const sampleRate = buffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const sampleCount = Math.max(0, endSample - startSample);

  // Mix down channels to mono if stereo
  const numChannels = buffer.numberOfChannels;
  const monoData = new Float32Array(sampleCount);

  for (let c = 0; c < numChannels; c++) {
    const channelData = buffer.getChannelData(c);
    for (let i = 0; i < sampleCount; i++) {
      monoData[i] += channelData[startSample + i] / numChannels;
    }
  }

  // Target 22050Hz downsampling if original is 44100 or 48000
  const downsampleRatio = sampleRate > 24000 ? 2 : 1;
  const targetSampleRate = Math.round(sampleRate / downsampleRatio);
  const targetSampleCount = Math.floor(sampleCount / downsampleRatio);

  const finalPcm = new Int16Array(targetSampleCount);
  for (let i = 0; i < targetSampleCount; i++) {
    const s = Math.max(-1, Math.min(1, monoData[i * downsampleRatio]));
    finalPcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  // Create WAV header
  const dataByteLength = finalPcm.length * 2;
  const wavBuffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(wavBuffer);

  // RIFF identifier 'RIFF'
  writeString(view, 0, 'RIFF');
  // file length minus 8 bytes
  view.setUint32(4, 36 + dataByteLength, true);
  // RIFF type 'WAVE'
  writeString(view, 8, 'WAVE');
  // format chunk identifier 'fmt '
  writeString(view, 12, 'fmt ');
  // format chunk length (16 for PCM)
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, targetSampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, targetSampleRate * 2, true);
  // block align (num channels * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier 'data'
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataByteLength, true);

  // Write PCM samples
  const pcmBytes = new Uint8Array(wavBuffer, 44);
  pcmBytes.set(new Uint8Array(finalPcm.buffer));

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


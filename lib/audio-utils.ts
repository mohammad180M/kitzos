/** Client-side audio helpers (Web Audio API). */

import { getMp3Encoder } from "./load-lame";

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|opus|flac|webm|weba|mp4|mkv)$/i;

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/") || file.type.startsWith("video/webm") || AUDIO_EXT.test(file.name);
}

export async function decodeAudioFile(
  file: File
): Promise<{ buffer: AudioBuffer; context: AudioContext }> {
  const context = new AudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await context.decodeAudioData(arrayBuffer.slice(0));
    return { buffer, context };
  } catch (error) {
    await context.close().catch(() => undefined);
    throw error;
  }
}

export async function resampleBuffer(
  buffer: AudioBuffer,
  targetRate = 44100
): Promise<AudioBuffer> {
  if (buffer.sampleRate === targetRate) return buffer;
  const length = Math.max(1, Math.ceil(buffer.duration * targetRate));
  const offline = new OfflineAudioContext(
    buffer.numberOfChannels,
    length,
    targetRate
  );
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}
export function sliceBuffer(
  source: AudioBuffer,
  startSec: number,
  endSec: number
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const channels = source.numberOfChannels;
  const start = Math.max(0, Math.floor(startSec * sampleRate));
  const end = Math.min(source.length, Math.floor(endSec * sampleRate));
  const length = Math.max(0, end - start);
  const offline = new OfflineAudioContext(channels, length, sampleRate);
  const dest = offline.createBuffer(channels, length, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    dest.getChannelData(ch).set(source.getChannelData(ch).subarray(start, end));
  }
  return dest;
}

export function concatBuffers(buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) {
    throw new Error("No audio buffers to merge.");
  }

  const sampleRate = buffers[0].sampleRate;
  const channels = buffers[0].numberOfChannels;
  const normalized = buffers.map((buffer) => matchBuffer(buffer, channels, sampleRate));
  const totalLength = normalized.reduce((sum, b) => sum + b.length, 0);
  const offline = new OfflineAudioContext(channels, totalLength, sampleRate);
  const result = offline.createBuffer(channels, totalLength, sampleRate);
  let offset = 0;

  for (const buffer of normalized) {
    for (let ch = 0; ch < channels; ch++) {
      result.getChannelData(ch).set(buffer.getChannelData(ch), offset);
    }
    offset += buffer.length;
  }

  return result;
}

function matchBuffer(
  buffer: AudioBuffer,
  channels: number,
  sampleRate: number
): AudioBuffer {
  if (buffer.numberOfChannels === channels && buffer.sampleRate === sampleRate) {
    return buffer;
  }

  const length = Math.max(1, Math.round(buffer.duration * sampleRate));
  const offline = new OfflineAudioContext(channels, length, sampleRate);
  const matched = offline.createBuffer(channels, length, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const src = buffer.getChannelData(Math.min(ch, buffer.numberOfChannels - 1));
    const dst = matched.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const srcIndex = Math.min(
        buffer.length - 1,
        Math.floor((i / length) * buffer.length)
      );
      dst[i] = src[srcIndex];
    }
  }

  return matched;
}

function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function mixToMono(buffer: AudioBuffer): Int16Array {
  const length = buffer.length;
  const mono = new Float32Array(length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += data[i] / buffer.numberOfChannels;
    }
  }
  return floatTo16BitPCM(mono);
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataLength = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < channels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export async function encodeMp3(buffer: AudioBuffer): Promise<Blob> {
  const Mp3Encoder = await getMp3Encoder();
  const resampled = await resampleBuffer(buffer, 44100);
  const channels = resampled.numberOfChannels === 1 ? 1 : 2;
  const encoder = new Mp3Encoder(channels, resampled.sampleRate, 128);
  const mp3Data: BlobPart[] = [];
  const pushPart = (part: Uint8Array) => {
    if (part.length > 0) mp3Data.push(new Uint8Array(part));
  };
  const blockSize = 1152;

  if (channels === 1) {
    const samples = mixToMono(resampled);
    for (let i = 0; i < samples.length; i += blockSize) {
      const chunk = samples.subarray(i, i + blockSize);
      const out = encoder.encodeBuffer(chunk);
      pushPart(out);
    }
  } else {
    const left = floatTo16BitPCM(resampled.getChannelData(0));
    const right = floatTo16BitPCM(resampled.getChannelData(1));
    for (let i = 0; i < left.length; i += blockSize) {
      const out = encoder.encodeBuffer(
        left.subarray(i, i + blockSize),
        right.subarray(i, i + blockSize)
      );
      pushPart(out);
    }
  }

  const end = encoder.flush();
  pushPart(end);

  if (mp3Data.length === 0) {
    throw new Error("MP3 encoder produced no output");
  }

  return new Blob(mp3Data, { type: "audio/mpeg" });
}

export { downloadBlob } from "./download";
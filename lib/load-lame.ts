/** Browser-only loader for the fixed lamejs build (NPM `lamejs` 1.2.1 is broken). */

export interface LameMp3Encoder {
  encodeBuffer(left: Int16Array, right?: Int16Array): Uint8Array;
  flush(): Uint8Array;
}

export type LameMp3EncoderCtor = new (
  channels: number,
  sampleRate: number,
  kbps: number
) => LameMp3Encoder;

let encoderCtor: LameMp3EncoderCtor | null = null;

export async function getMp3Encoder(): Promise<LameMp3EncoderCtor> {
  if (encoderCtor) return encoderCtor;
  const lame = await import("@breezystack/lamejs");
  encoderCtor = lame.Mp3Encoder as LameMp3EncoderCtor;
  return encoderCtor;
}

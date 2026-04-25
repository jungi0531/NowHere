import { File, Paths } from 'expo-file-system';

import { requireEnv } from '@/infrastructure/env';

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const SAMPLE_RATE = 24000;

function buildWavHeader(pcmByteLength: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  // RIFF chunk
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46);
  view.setUint32(4, 36 + pcmByteLength, true);
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45);
  // fmt chunk
  view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  // data chunk
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61);
  view.setUint32(40, pcmByteLength, true);

  return buffer;
}

type TtsCandidate = {
  content?: {
    parts?: { inlineData?: { data?: string; mimeType?: string } }[];
  };
};

type TtsResponse = {
  candidates?: TtsCandidate[];
};

export async function generateAudio(script: string, sessionId: string): Promise<string> {
  const { geminiApiKey } = requireEnv();
  const url = `${GEMINI_BASE_URL}/models/${GEMINI_TTS_MODEL}:generateContent?key=${geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: script }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini TTS API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as TtsResponse;
  const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inlineData?.data) throw new Error('Gemini TTS API returned no audio data');

  const pcmBytes = Uint8Array.from(atob(inlineData.data), (c) => c.charCodeAt(0));
  const wavHeader = new Uint8Array(buildWavHeader(pcmBytes.byteLength));
  const wavBytes = new Uint8Array(44 + pcmBytes.byteLength);
  wavBytes.set(wavHeader, 0);
  wavBytes.set(pcmBytes, 44);

  const file = new File(Paths.document, `session-${sessionId}.wav`);
  file.write(wavBytes);

  return file.uri;
}

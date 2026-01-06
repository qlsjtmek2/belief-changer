import type { TTSVoice } from '../types';
import { BaseHTTPProvider } from './BaseHTTPProvider';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * ElevenLabs 기본 음성 목록
 * API 키 없을 때 사용할 수 있는 인기 음성들
 */
const DEFAULT_VOICES: TTSVoice[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', provider: 'elevenlabs' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', provider: 'elevenlabs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', provider: 'elevenlabs' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', provider: 'elevenlabs' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', provider: 'elevenlabs' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', provider: 'elevenlabs' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', provider: 'elevenlabs' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', provider: 'elevenlabs' },
];

/**
 * ElevenLabs TTS Provider
 *
 * 고품질 AI 음성 합성 서비스입니다.
 * - eleven_multilingual_v2 모델로 한국어 지원
 * - 다양한 음성 스타일 제공
 * - API 키 필요
 *
 * @see https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export class ElevenLabsProvider extends BaseHTTPProvider {
  readonly name = 'ElevenLabs';
  readonly type = 'elevenlabs' as const;

  async getAvailableVoices(): Promise<TTSVoice[]> {
    if (!this.apiKey) {
      return DEFAULT_VOICES;
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        console.warn('ElevenLabs 음성 목록 조회 실패:', response.status);
        return DEFAULT_VOICES;
      }

      const data = await response.json();

      return data.voices.map(
        (v: { voice_id: string; name: string; labels?: Record<string, string> }) => ({
          id: v.voice_id,
          name: v.name,
          provider: 'elevenlabs' as const,
          meta: v.labels,
        })
      );
    } catch (error) {
      console.warn('ElevenLabs 음성 목록 조회 오류:', error);
      return DEFAULT_VOICES;
    }
  }

  protected async generateAudio(
    text: string,
    voiceId: string,
    signal?: AbortSignal
  ): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API 키가 설정되지 않았습니다.');
    }

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
        signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `ElevenLabs API 오류 (${response.status}): ${errorText || response.statusText}`
      );
    }

    return response.blob();
  }
}

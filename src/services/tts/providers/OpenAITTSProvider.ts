import type { TTSVoice, TTSProviderConfig } from '../types';
import { BaseHTTPProvider } from './BaseHTTPProvider';

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

/**
 * OpenAI TTS 음성 목록
 * 고정 목록 (API 없음)
 */
const OPENAI_VOICES: TTSVoice[] = [
  { id: 'alloy', name: 'Alloy (중성)', provider: 'openai' },
  { id: 'ash', name: 'Ash', provider: 'openai' },
  { id: 'coral', name: 'Coral', provider: 'openai' },
  { id: 'echo', name: 'Echo (남성)', provider: 'openai' },
  { id: 'fable', name: 'Fable (영국 억양)', provider: 'openai' },
  { id: 'nova', name: 'Nova (여성)', provider: 'openai' },
  { id: 'onyx', name: 'Onyx (남성, 깊은)', provider: 'openai' },
  { id: 'sage', name: 'Sage', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer (여성)', provider: 'openai' },
];

/**
 * OpenAI TTS Provider
 *
 * OpenAI의 Text-to-Speech API를 사용합니다.
 * - tts-1 모델 사용 (빠른 응답)
 * - 다국어 지원 (한국어 포함)
 * - API 키 필요 (OpenAI API 키)
 *
 * @see https://platform.openai.com/docs/guides/text-to-speech
 */
export class OpenAITTSProvider extends BaseHTTPProvider {
  readonly name = 'OpenAI TTS';
  readonly type = 'openai' as const;

  async initialize(config: TTSProviderConfig): Promise<void> {
    await super.initialize(config);
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // OpenAI는 고정 음성 목록 (별도 API 없음)
    return OPENAI_VOICES;
  }

  async getKoreanVoices(): Promise<TTSVoice[]> {
    // OpenAI TTS는 모든 음성이 다국어(한국어 포함) 지원
    return this.getAvailableVoices();
  }

  protected async generateAudio(
    text: string,
    voiceId: string,
    signal?: AbortSignal
  ): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // voiceSettings에서 speed 가져오기 (기본값 1.0)
    const speed = this.voiceSettings?.rate ?? 1.0;

    const response = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voiceId,
        input: text,
        response_format: 'mp3',
        speed: Math.min(Math.max(speed, 0.25), 4.0), // 0.25 ~ 4.0 범위 제한
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } }).error?.message ||
        response.statusText;
      throw new Error(`OpenAI TTS API 오류 (${response.status}): ${errorMessage}`);
    }

    return response.blob();
  }
}

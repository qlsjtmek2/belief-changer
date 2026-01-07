/**
 * TTS 서비스 공개 API
 */

import type { VoiceSettings } from '../../types';
import { ttsManager } from './TTSManager';
import { speakTextWithProvider, stopText } from './speakText';

// === 타입 export ===
export type { TTSProvider, TTSVoice, TTSProviderConfig, TTSSpeakOptions } from './types';
export type { SpeakTextOptions } from './speakText';

// === Manager export ===
export { ttsManager } from './TTSManager';

// === AudioSessionKeeper export (백그라운드 재생용) ===
export { audioSessionKeeper } from './AudioSessionKeeper';

// === 텍스트 재생 옵션 ===
export interface SpeakOptions {
  settings?: VoiceSettings;
  /** 사용할 음성 ID 목록 (랜덤 선택용) */
  voices?: string[];
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 단일 텍스트를 재생합니다.
 * 음성은 랜덤으로 선택됩니다.
 */
export async function speakText(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  // Provider가 설정되지 않았으면 WebSpeech 사용
  if (!ttsManager.isReady()) {
    await ttsManager.setProvider('webspeech', {
      voiceSettings: options.settings,
    });
  }

  const provider = ttsManager.getProvider();
  if (!provider) {
    const error = new Error('TTS Provider를 초기화할 수 없습니다.');
    options.onError?.(error);
    throw error;
  }

  return speakTextWithProvider(text, provider, options);
}

/**
 * 현재 재생을 일시정지합니다.
 */
export function pause(): void {
  ttsManager.getProvider()?.pause();
}

/**
 * 일시정지된 재생을 재개합니다.
 */
export function resume(): void {
  ttsManager.getProvider()?.resume();
}

/**
 * 현재 재생을 중지합니다.
 */
export function stop(): void {
  stopText();
  ttsManager.getProvider()?.stop();
}

/**
 * 현재 재생 상태를 반환합니다.
 */
export function getPlaybackState(): { isPlaying: boolean; isPaused: boolean } {
  return ttsManager.getProvider()?.getPlaybackState() ?? {
    isPlaying: false,
    isPaused: false,
  };
}

/**
 * 텍스트를 미리 로드하여 캐시에 저장합니다.
 * 백그라운드 재생 시 다음 확언을 미리 로드하여 간극을 최소화합니다.
 * HTTP 기반 Provider(ElevenLabs, OpenAI)에서만 지원됩니다.
 */
export async function preloadText(
  text: string,
  options: { voice?: string } = {}
): Promise<void> {
  const provider = ttsManager.getProvider();
  if (!provider || !provider.preload) {
    return; // WebSpeech는 preload 미지원
  }

  // 음성 ID 결정: 지정된 음성 또는 한국어 음성 중 첫 번째
  let voiceId = options.voice;
  if (!voiceId) {
    const koreanVoices = await provider.getKoreanVoices();
    if (koreanVoices.length > 0) {
      voiceId = koreanVoices[0].id;
    }
  }

  if (!voiceId) {
    return; // 사용 가능한 음성 없음
  }

  return provider.preload(text, voiceId);
}

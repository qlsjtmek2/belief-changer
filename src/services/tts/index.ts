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

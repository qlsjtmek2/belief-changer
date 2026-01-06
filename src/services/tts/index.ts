/**
 * TTS 서비스 공개 API
 *
 * 기존 함수 시그니처를 유지하여 하위 호환성을 보장합니다.
 * 새로운 Provider 패턴은 ttsManager를 통해 사용할 수 있습니다.
 */

import type { DialogueLine, VoiceSettings } from '../../types';
import { ttsManager } from './TTSManager';
import { speakDialogueWithProvider, stopDialogue } from './speakDialogue';

// === 타입 export ===
export type { TTSProvider, TTSVoice, TTSProviderConfig, TTSSpeakOptions } from './types';
export type { SpeakDialogueOptions } from './speakDialogue';

// === Manager export ===
export { ttsManager } from './TTSManager';

// === 대화 재생 옵션 (하위 호환) ===
export interface LegacySpeakDialogueOptions {
  settings?: VoiceSettings;
  loop?: boolean;
  onLineStart?: (index: number) => void;
  onLineEnd?: (index: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 대화 스크립트를 순차 재생합니다.
 *
 * Provider가 설정되지 않은 경우 자동으로 WebSpeech를 사용합니다.
 *
 * @param lines - 대화 라인 배열
 * @param options - 재생 옵션
 */
export async function speakDialogue(
  lines: DialogueLine[],
  options: LegacySpeakDialogueOptions = {}
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

  return speakDialogueWithProvider(lines, provider, options);
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
  stopDialogue(); // 루프 중지
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

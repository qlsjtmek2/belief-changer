import type { VoiceSettings } from '../../types';
import type { TTSProvider, TTSVoice } from './types';

/**
 * 텍스트 재생 옵션
 */
export interface SpeakTextOptions {
  settings?: VoiceSettings;
  /** 사용할 음성 목록 (랜덤 선택용) */
  voices?: string[];
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// 모듈 레벨 상태
let shouldStop = false;

/**
 * 단일 텍스트를 재생합니다.
 * 음성은 사용 가능한 음성 중 랜덤으로 선택됩니다.
 */
export async function speakTextWithProvider(
  text: string,
  provider: TTSProvider,
  options: SpeakTextOptions = {}
): Promise<void> {
  const availableVoices = await provider.getAvailableVoices();

  if (availableVoices.length === 0) {
    const error = new Error('사용 가능한 음성이 없습니다.');
    options.onError?.(error);
    throw error;
  }

  // 음성 선택: 지정된 음성 목록에서 랜덤, 없으면 전체에서 랜덤
  let voice: TTSVoice;

  if (options.voices && options.voices.length > 0) {
    // 지정된 음성 목록에서 랜덤 선택
    const randomVoiceId = options.voices[Math.floor(Math.random() * options.voices.length)];
    voice = availableVoices.find((v) => v.id === randomVoiceId) || availableVoices[0];
  } else {
    // 전체 음성에서 랜덤 선택
    voice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
  }

  shouldStop = false;
  options.onStart?.();

  try {
    await provider.speak(text, {
      voice,
      settings: options.settings,
    });

    if (!shouldStop) {
      options.onComplete?.();
    }
  } catch (error) {
    if (shouldStop) {
      return;
    }
    options.onError?.(error as Error);
    throw error;
  }
}

/**
 * 재생 중지 플래그 설정
 */
export function stopText(): void {
  shouldStop = true;
}

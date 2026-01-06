import type { DialogueLine, VoiceSettings } from '../../types';
import type { TTSProvider, TTSVoice } from './types';

/**
 * 대화 재생 옵션
 */
export interface SpeakDialogueOptions {
  settings?: VoiceSettings;
  loop?: boolean;
  onLineStart?: (index: number) => void;
  onLineEnd?: (index: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// 모듈 레벨 상태 (재생 루프 제어용)
let shouldStop = false;
let isLooping = false;

/**
 * 대화 스크립트를 순차 재생합니다.
 *
 * 화자별로 다른 음성을 자동 할당하며, loop 옵션이 true면 무한 반복합니다.
 *
 * @param lines - 대화 라인 배열
 * @param provider - TTS Provider 인스턴스
 * @param options - 재생 옵션
 */
export async function speakDialogueWithProvider(
  lines: DialogueLine[],
  provider: TTSProvider,
  options: SpeakDialogueOptions = {}
): Promise<void> {
  // 사용 가능한 음성 목록 가져오기
  const availableVoices = await provider.getAvailableVoices();

  if (availableVoices.length === 0) {
    const error = new Error('사용 가능한 음성이 없습니다.');
    options.onError?.(error);
    throw error;
  }

  // 화자별 음성 할당 (순환)
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  const voiceMap = new Map<string, TTSVoice>();

  speakers.forEach((speaker, index) => {
    const voiceIndex = index % availableVoices.length;
    voiceMap.set(speaker, availableVoices[voiceIndex]);
  });

  // 상태 초기화
  shouldStop = false;
  isLooping = options.loop ?? true; // 기본값: 반복 재생

  // 반복 재생 루프
  do {
    for (let i = 0; i < lines.length; i++) {
      // 중지 요청 확인
      if (shouldStop) {
        return;
      }

      const line = lines[i];
      const voice = voiceMap.get(line.speaker);

      if (!voice) continue;

      options.onLineStart?.(i);

      try {
        await provider.speak(line.text, {
          voice,
          settings: options.settings,
        });
        options.onLineEnd?.(i);
      } catch (error) {
        // 중지로 인한 에러는 무시
        if (shouldStop) {
          return;
        }
        options.onError?.(error as Error);
        throw error;
      }
    }
  } while (isLooping && !shouldStop);

  options.onComplete?.();
}

/**
 * 대화 재생 중지 플래그 설정
 */
export function stopDialogue(): void {
  shouldStop = true;
  isLooping = false;
}

/**
 * 현재 루프 상태 반환
 */
export function isDialogueLooping(): boolean {
  return isLooping;
}

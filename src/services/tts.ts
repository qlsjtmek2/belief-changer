import type { DialogueLine, VoiceSettings } from '../types';

// === 음성 관련 타입 ===
export interface Voice {
  id: string;
  name: string;
  lang: string;
  native: SpeechSynthesisVoice;
}

// === 상태 관리 ===
let isPlaying = false;
let isPaused = false;
let shouldStop = false;
let isLooping = false;

// === 음성 목록 가져오기 ===

/**
 * 브라우저에서 사용 가능한 음성 목록을 가져옵니다.
 * Chrome에서는 비동기로 로딩되므로 Promise를 반환합니다.
 */
export function getVoices(): Promise<Voice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(mapVoices(voices));
      return;
    }

    // Chrome: 음성이 비동기로 로딩됨
    speechSynthesis.onvoiceschanged = () => {
      resolve(mapVoices(speechSynthesis.getVoices()));
    };
  });
}

/**
 * 한국어 음성만 필터링하여 가져옵니다.
 */
export async function getKoreanVoices(): Promise<Voice[]> {
  const voices = await getVoices();
  return voices.filter((v) => v.lang.startsWith('ko'));
}

function mapVoices(nativeVoices: SpeechSynthesisVoice[]): Voice[] {
  return nativeVoices.map((voice) => ({
    id: voice.voiceURI,
    name: voice.name,
    lang: voice.lang,
    native: voice,
  }));
}

// === 단일 발화 ===

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice;
  settings?: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 텍스트를 음성으로 발화합니다.
 */
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이전 발화만 취소 (상태는 유지)
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (options.voice) {
      utterance.voice = options.voice;
    }

    if (options.settings) {
      utterance.rate = options.settings.rate;
      utterance.pitch = options.settings.pitch;
      utterance.volume = options.settings.volume;
    }

    utterance.onstart = () => {
      isPlaying = true;
      isPaused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      isPlaying = false;
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      isPlaying = false;
      const error = new Error(`TTS 오류: ${event.error}`);
      options.onError?.(error);
      reject(error);
    };

    speechSynthesis.speak(utterance);
  });
}

// === 대화 순차 재생 ===

export interface SpeakDialogueOptions {
  settings?: VoiceSettings;
  loop?: boolean;
  onLineStart?: (index: number) => void;
  onLineEnd?: (index: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 화자별로 다른 목소리를 할당하여 대화 스크립트를 순차 재생합니다.
 * loop 옵션이 true면 무한 반복 재생합니다.
 */
export async function speakDialogue(
  lines: DialogueLine[],
  options: SpeakDialogueOptions = {}
): Promise<void> {
  const voices = await getKoreanVoices();

  // 한국어 음성이 없으면 전체 음성에서 선택
  const availableVoices =
    voices.length > 0 ? voices : await getVoices();

  if (availableVoices.length === 0) {
    const error = new Error('사용 가능한 음성이 없습니다.');
    options.onError?.(error);
    throw error;
  }

  // 화자별 음성 할당 (순환)
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  const voiceMap = new Map<string, SpeechSynthesisVoice>();

  speakers.forEach((speaker, index) => {
    const voiceIndex = index % availableVoices.length;
    voiceMap.set(speaker, availableVoices[voiceIndex].native);
  });

  // 상태 초기화
  isPlaying = true;
  shouldStop = false;
  isLooping = options.loop ?? true; // 기본값: 반복 재생

  // 반복 재생 루프
  do {
    // 순차 재생
    for (let i = 0; i < lines.length; i++) {
      // 중지 요청 확인
      if (shouldStop) {
        isPlaying = false;
        return;
      }

      const line = lines[i];
      const voice = voiceMap.get(line.speaker);

      options.onLineStart?.(i);

      try {
        await speak(line.text, {
          voice,
          settings: options.settings,
        });
        options.onLineEnd?.(i);
      } catch (error) {
        // 중지로 인한 에러는 무시
        if (shouldStop) {
          isPlaying = false;
          return;
        }
        options.onError?.(error as Error);
        throw error;
      }
    }
  } while (isLooping && !shouldStop);

  isPlaying = false;
  options.onComplete?.();
}

// === 재생 컨트롤 ===

/**
 * 현재 재생을 일시정지합니다.
 */
export function pause(): void {
  if (isPlaying && !isPaused) {
    speechSynthesis.pause();
    isPaused = true;
  }
}

/**
 * 일시정지된 재생을 재개합니다.
 */
export function resume(): void {
  if (isPaused) {
    speechSynthesis.resume();
    isPaused = false;
  }
}

/**
 * 현재 재생을 중지합니다.
 */
export function stop(): void {
  shouldStop = true;
  isLooping = false;
  speechSynthesis.cancel();
  isPlaying = false;
  isPaused = false;
}

/**
 * 현재 재생 상태를 반환합니다.
 */
export function getPlaybackState(): { isPlaying: boolean; isPaused: boolean } {
  return { isPlaying, isPaused };
}

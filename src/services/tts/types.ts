import type { VoiceSettings, TTSProviderType, OpenAITTSModel } from '../../types';

/**
 * TTS 음성 정보
 */
export interface TTSVoice {
  id: string;
  name: string;
  provider: TTSProviderType;
  lang?: string;
  /** Provider별 네이티브 객체 (WebSpeech의 SpeechSynthesisVoice 등) */
  meta?: unknown;
}

/**
 * Provider 초기화 설정
 */
export interface TTSProviderConfig {
  apiKey?: string;
  voiceSettings?: VoiceSettings;
  openaiModel?: OpenAITTSModel;
}

/**
 * 단일 발화 옵션
 */
export interface TTSSpeakOptions {
  voice: TTSVoice;
  settings?: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * TTS Provider 인터페이스
 *
 * 모든 TTS 구현체가 따라야 하는 공통 인터페이스입니다.
 */
export interface TTSProvider {
  /** Provider 표시 이름 */
  readonly name: string;
  /** Provider 타입 식별자 */
  readonly type: TTSProviderType;

  /**
   * Provider 초기화
   * API 키 설정, 음성 목록 로딩 등
   */
  initialize(config: TTSProviderConfig): Promise<void>;

  /**
   * 사용 가능한 음성 목록 반환
   */
  getAvailableVoices(): Promise<TTSVoice[]>;

  /**
   * 한국어 음성 목록 반환
   * Provider별 필터링 로직 적용
   */
  getKoreanVoices(): Promise<TTSVoice[]>;

  /**
   * 텍스트를 음성으로 발화
   * Promise는 발화 완료 또는 에러 시 resolve/reject
   */
  speak(text: string, options: TTSSpeakOptions): Promise<void>;

  /** 재생 일시정지 */
  pause(): void;

  /** 일시정지 재개 */
  resume(): void;

  /** 재생 중지 */
  stop(): void;

  /** 현재 재생 상태 반환 */
  getPlaybackState(): { isPlaying: boolean; isPaused: boolean };

  /** 리소스 정리 */
  dispose(): void;
}

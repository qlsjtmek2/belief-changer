import type { TTSProvider, TTSVoice, TTSProviderConfig, TTSSpeakOptions } from '../types';
import type { TTSProviderType, VoiceSettings } from '../../../types';
import { ttsCache } from '../cache';

/**
 * HTTP 기반 TTS Provider 추상 클래스
 *
 * ElevenLabs, OpenAI 등 HTTP API를 사용하는 Provider의 공통 로직을 제공합니다.
 * - HTTP fetch → Blob → HTMLAudioElement 재생
 * - 세션 캐시 연동
 * - 재생 컨트롤 (pause, resume, stop)
 */
export abstract class BaseHTTPProvider implements TTSProvider {
  abstract readonly name: string;
  abstract readonly type: TTSProviderType;

  protected apiKey = '';
  protected voiceSettings?: VoiceSettings;
  protected audio: HTMLAudioElement | null = null;
  protected isPlaying = false;
  protected isPaused = false;
  protected abortController: AbortController | null = null;

  async initialize(config: TTSProviderConfig): Promise<void> {
    this.apiKey = config.apiKey ?? '';
    this.voiceSettings = config.voiceSettings;
  }

  abstract getAvailableVoices(): Promise<TTSVoice[]>;
  abstract getKoreanVoices(): Promise<TTSVoice[]>;

  /**
   * 서브클래스에서 구현: 텍스트를 오디오 Blob으로 변환
   */
  protected abstract generateAudio(
    text: string,
    voiceId: string,
    signal?: AbortSignal
  ): Promise<Blob>;

  async speak(text: string, options: TTSSpeakOptions): Promise<void> {
    const cacheKey = ttsCache.generateKey(this.type, options.voice.id, text);
    let audioUrl = ttsCache.get(cacheKey);

    if (!audioUrl) {
      // 새로 생성
      this.abortController = new AbortController();

      try {
        const blob = await this.generateAudio(
          text,
          options.voice.id,
          this.abortController.signal
        );
        audioUrl = URL.createObjectURL(blob);
        ttsCache.set(cacheKey, audioUrl);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return; // 중단됨
        }
        throw error;
      }
    }

    return this.playAudio(audioUrl, options);
  }

  protected playAudio(url: string, options: TTSSpeakOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop(); // 기존 재생 중지

      this.audio = new Audio(url);

      this.audio.onplay = () => {
        this.isPlaying = true;
        this.isPaused = false;
        options.onStart?.();
      };

      this.audio.onended = () => {
        this.isPlaying = false;
        options.onEnd?.();
        resolve();
      };

      this.audio.onerror = () => {
        this.isPlaying = false;
        const error = new Error('오디오 재생 실패');
        options.onError?.(error);
        reject(error);
      };

      this.audio.play().catch((error) => {
        this.isPlaying = false;
        options.onError?.(error);
        reject(error);
      });
    });
  }

  pause(): void {
    if (this.audio && this.isPlaying && !this.isPaused) {
      this.audio.pause();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.audio && this.isPaused) {
      this.audio.play();
      this.isPaused = false;
    }
  }

  stop(): void {
    // 진행 중인 HTTP 요청 중단
    this.abortController?.abort();
    this.abortController = null;

    // 오디오 재생 중지
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    this.isPlaying = false;
    this.isPaused = false;
  }

  getPlaybackState(): { isPlaying: boolean; isPaused: boolean } {
    return { isPlaying: this.isPlaying, isPaused: this.isPaused };
  }

  dispose(): void {
    this.stop();
  }
}

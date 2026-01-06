import type { TTSProvider, TTSVoice, TTSProviderConfig, TTSSpeakOptions } from '../types';

/**
 * Web Speech API 기반 TTS Provider
 *
 * 브라우저 내장 SpeechSynthesis API를 사용합니다.
 * - 무료, 오프라인 지원
 * - 음성 품질은 브라우저/OS에 따라 다름
 */
export class WebSpeechProvider implements TTSProvider {
  readonly name = 'Web Speech';
  readonly type = 'webspeech' as const;

  private isPlaying = false;
  private isPaused = false;

  async initialize(_config: TTSProviderConfig): Promise<void> {
    // 음성 목록 로딩 대기 (Chrome 비동기 로딩 대응)
    await this.getAvailableVoices();
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();

      if (voices.length > 0) {
        resolve(this.mapVoices(voices));
        return;
      }

      // Chrome: 음성이 비동기로 로딩됨
      const handleVoicesChanged = () => {
        speechSynthesis.onvoiceschanged = null;
        resolve(this.mapVoices(speechSynthesis.getVoices()));
      };

      speechSynthesis.onvoiceschanged = handleVoicesChanged;

      // 타임아웃: 3초 후에도 로딩 안 되면 빈 배열 반환
      setTimeout(() => {
        speechSynthesis.onvoiceschanged = null;
        resolve(this.mapVoices(speechSynthesis.getVoices()));
      }, 3000);
    });
  }

  /**
   * 한국어 음성만 필터링하여 반환
   */
  async getKoreanVoices(): Promise<TTSVoice[]> {
    const voices = await this.getAvailableVoices();
    return voices.filter((v) => v.lang?.startsWith('ko'));
  }

  async speak(text: string, options: TTSSpeakOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이전 발화만 취소 (상태는 유지)
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 음성 설정
      if (options.voice.meta) {
        utterance.voice = options.voice.meta as SpeechSynthesisVoice;
      }

      if (options.settings) {
        utterance.rate = options.settings.rate;
        utterance.pitch = options.settings.pitch;
        utterance.volume = options.settings.volume;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        // 'canceled' 에러는 stop()으로 인한 것이므로 무시
        if (event.error === 'canceled') {
          resolve();
          return;
        }
        const error = new Error(`TTS 오류: ${event.error}`);
        options.onError?.(error);
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  }

  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.isPaused) {
      speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  stop(): void {
    speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
  }

  getPlaybackState(): { isPlaying: boolean; isPaused: boolean } {
    return { isPlaying: this.isPlaying, isPaused: this.isPaused };
  }

  dispose(): void {
    this.stop();
  }

  private mapVoices(nativeVoices: SpeechSynthesisVoice[]): TTSVoice[] {
    return nativeVoices.map((voice) => ({
      id: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      provider: 'webspeech' as const,
      meta: voice,
    }));
  }
}

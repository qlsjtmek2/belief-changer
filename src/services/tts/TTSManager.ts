import type { TTSProvider, TTSProviderConfig } from './types';
import type { TTSProviderType } from '../../types';
import { WebSpeechProvider, ElevenLabsProvider, OpenAITTSProvider } from './providers';

/**
 * TTS Provider 관리자 (싱글톤)
 *
 * Provider 생성, 초기화, 전환을 담당합니다.
 * - Provider 인스턴스 캐싱
 * - 현재 활성 Provider 관리
 */
class TTSManager {
  private static instance: TTSManager;

  private currentProvider: TTSProvider | null = null;
  private providers = new Map<TTSProviderType, TTSProvider>();

  private constructor() {
    // 싱글톤
  }

  static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }

  /**
   * Provider 설정 및 초기화
   *
   * @param type - Provider 타입
   * @param config - 초기화 설정 (API 키, 음성 설정 등)
   */
  async setProvider(
    type: TTSProviderType,
    config: TTSProviderConfig = {}
  ): Promise<void> {
    // 기존 Provider 중지
    this.currentProvider?.stop();

    // 캐시된 Provider가 있으면 재사용
    let provider = this.providers.get(type);

    if (!provider) {
      // 새 Provider 생성
      provider = this.createProvider(type);
      this.providers.set(type, provider);
    }

    // 초기화 (API 키 등 갱신)
    await provider.initialize(config);
    this.currentProvider = provider;
  }

  /**
   * 현재 활성 Provider 반환
   */
  getProvider(): TTSProvider | null {
    return this.currentProvider;
  }

  /**
   * 현재 Provider 타입 반환
   */
  getCurrentType(): TTSProviderType | null {
    return this.currentProvider?.type ?? null;
  }

  /**
   * Provider가 준비되었는지 확인
   */
  isReady(): boolean {
    return this.currentProvider !== null;
  }

  /**
   * 모든 Provider 정리
   */
  dispose(): void {
    this.providers.forEach((provider) => provider.dispose());
    this.providers.clear();
    this.currentProvider = null;
  }

  private createProvider(type: TTSProviderType): TTSProvider {
    switch (type) {
      case 'webspeech':
        return new WebSpeechProvider();
      case 'elevenlabs':
        return new ElevenLabsProvider();
      case 'openai':
        return new OpenAITTSProvider();
      default:
        throw new Error(`알 수 없는 TTS Provider 타입: ${type}`);
    }
  }
}

/** 전역 TTS Manager 인스턴스 */
export const ttsManager = TTSManager.getInstance();

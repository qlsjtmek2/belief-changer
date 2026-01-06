/**
 * TTS 오디오 세션 캐시
 *
 * ElevenLabs, OpenAI 등 HTTP 기반 TTS의 생성된 오디오를 캐싱합니다.
 * - LRU 정책으로 최대 항목 수 제한
 * - 브라우저 메모리에 저장 (새로고침 시 초기화)
 * - Blob URL 메모리 해제 자동 처리
 */
class TTSCache {
  private cache = new Map<string, string>(); // cacheKey -> Blob URL
  private accessOrder: string[] = []; // LRU 추적
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  /**
   * 캐시 키 생성
   * @param provider - Provider 타입 (elevenlabs, openai 등)
   * @param voiceId - 음성 ID
   * @param text - 발화 텍스트
   */
  generateKey(provider: string, voiceId: string, text: string): string {
    return `${provider}:${voiceId}:${this.hashText(text)}`;
  }

  /**
   * 캐시에서 URL 가져오기
   */
  get(key: string): string | undefined {
    const url = this.cache.get(key);
    if (url) {
      // LRU: 접근 순서 갱신
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      this.accessOrder.push(key);
    }
    return url;
  }

  /**
   * 캐시에 URL 저장
   */
  set(key: string, url: string): void {
    // 이미 존재하면 업데이트만
    if (this.cache.has(key)) {
      this.cache.set(key, url);
      return;
    }

    // 용량 초과 시 가장 오래된 항목 제거
    while (this.cache.size >= this.maxSize) {
      const oldest = this.accessOrder.shift();
      if (oldest) {
        const oldUrl = this.cache.get(oldest);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, url);
    this.accessOrder.push(key);
  }

  /**
   * 특정 항목 삭제
   */
  delete(key: string): void {
    const url = this.cache.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
    }
  }

  /**
   * 전체 캐시 초기화
   */
  clear(): void {
    this.cache.forEach((url) => URL.revokeObjectURL(url));
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * 현재 캐시 크기
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * djb2 해시 알고리즘으로 텍스트 해싱
   */
  private hashText(text: string): string {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) + hash + text.charCodeAt(i);
    }
    // 음수 방지 및 base36 변환
    return (hash >>> 0).toString(36);
  }
}

/** 전역 TTS 캐시 인스턴스 */
export const ttsCache = new TTSCache();

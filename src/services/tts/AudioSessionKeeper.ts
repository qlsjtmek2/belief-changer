/**
 * AudioSessionKeeper
 *
 * 모바일 브라우저에서 백그라운드 오디오 재생을 유지하기 위한 유틸리티.
 * Web Audio API로 거의 들리지 않는 무음 오디오를 지속 재생하여
 * 확언 사이의 간극에서도 오디오 세션이 유지되도록 합니다.
 */

// Safari 호환을 위한 AudioContext 타입
const AudioContextClass =
  window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

class AudioSessionKeeper {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;

  /**
   * 무음 오디오 재생을 시작합니다.
   * 재생 버튼 클릭 등 사용자 인터랙션 시점에 호출해야 합니다.
   */
  start(): void {
    if (this.isRunning) return;

    try {
      // AudioContext 생성
      this.audioContext = new AudioContextClass();

      // suspended 상태면 resume (사용자 인터랙션 필요)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // GainNode: 볼륨을 거의 0으로 설정 (0.001 = -60dB)
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.001;
      this.gainNode.connect(this.audioContext.destination);

      // OscillatorNode: 1Hz 사인파 (거의 들리지 않는 주파수)
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 1; // 1Hz - 인간 가청 범위 밖
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();

      this.isRunning = true;
    } catch (error) {
      console.warn('AudioSessionKeeper: Web Audio API를 사용할 수 없습니다.', error);
      this.cleanup();
    }
  }

  /**
   * 무음 오디오 재생을 중지합니다.
   */
  stop(): void {
    if (!this.isRunning) return;
    this.cleanup();
  }

  /**
   * 현재 실행 중인지 확인합니다.
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 리소스를 정리합니다.
   */
  private cleanup(): void {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // 이미 중지된 경우 무시
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // close 실패 무시
      });
      this.audioContext = null;
    }

    this.isRunning = false;
  }
}

// 싱글톤 인스턴스
export const audioSessionKeeper = new AudioSessionKeeper();

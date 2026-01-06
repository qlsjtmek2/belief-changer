import { useCallback, useRef, useEffect } from 'react';
import { useAffirmationStore, useSettingsStore, toast } from '../store';
import { speakText, pause, resume, stop, ttsManager } from '../services';
import './PlayerBar.css';

// Media Session API 지원 여부 확인
const isMediaSessionSupported = 'mediaSession' in navigator;

// 기술적 오류 메시지를 사용자 친화적으로 변환
function formatErrorMessage(error: Error): string {
  const msg = error.message;

  if (msg.includes('quota_exceeded') || msg.includes('quota')) {
    return '음성 API 할당량이 초과되었습니다. 설정에서 다른 TTS를 선택해주세요.';
  }
  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return 'API 키가 유효하지 않습니다.';
  }
  if (msg.includes('API 키가 설정되지')) {
    return 'API 키가 설정되지 않았습니다. 설정에서 입력해주세요.';
  }
  if (msg.includes('429')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }
  if (msg.includes('네트워크') || msg.includes('network') || msg.includes('fetch')) {
    return '네트워크 연결을 확인해주세요.';
  }

  return '재생 중 오류가 발생했습니다.';
}

export function PlayerBar() {
  const {
    affirmations,
    currentIndex,
    playbackStatus,
    playRequested,
    setCurrentIndex,
    advanceToNext,
    setPlaybackStatus,
    resetPlayback,
    clearPlayRequest,
  } = useAffirmationStore();

  const {
    voiceSettings,
    ttsProvider,
    getActiveApiKey,
    hasTTSApiKey,
    getSelectedVoice,
  } = useSettingsStore();

  const isPlayingRef = useRef(false);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
    };
  }, []);

  // handlePlay를 ref로 저장 (useEffect에서 사용)
  const handlePlayRef = useRef<() => void>(() => {});

  const currentAffirmation = affirmations[currentIndex];

  // 재생
  const handlePlay = useCallback(async () => {
    if (affirmations.length === 0) return;

    // 일시정지 상태면 재개
    if (playbackStatus === 'paused') {
      resume();
      setPlaybackStatus('playing');
      return;
    }

    // TTS API 키 확인 (WebSpeech 제외)
    if (!hasTTSApiKey()) {
      toast.error('TTS API 키가 설정되지 않았습니다. 설정에서 입력해주세요.');
      return;
    }

    setPlaybackStatus('playing');
    isPlayingRef.current = true;

    try {
      await ttsManager.setProvider(ttsProvider.activeProvider, {
        apiKey: getActiveApiKey(),
        voiceSettings,
      });

      let idx = currentIndex;

      // 무한 반복 재생
      while (isPlayingRef.current) {
        const affirmation = affirmations[idx];

        // 매 재생 시 최신 음성 설정 가져오기 (설정 변경 즉시 반영)
        const selectedVoice = getSelectedVoice();
        const voices = selectedVoice ? [selectedVoice] : undefined;

        await new Promise<void>((resolve, reject) => {
          speakText(affirmation.text, {
            settings: voiceSettings,
            voices,
            onComplete: () => resolve(),
            onError: (err) => reject(err),
          });
        });

        if (!isPlayingRef.current) break;

        // 다음 확언 재생 전 잠시 쉬기 (1.5초)
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 1500);
          // 중지 시 즉시 해제
          const checkStop = setInterval(() => {
            if (!isPlayingRef.current) {
              clearTimeout(timer);
              clearInterval(checkStop);
              resolve();
            }
          }, 100);
        });

        if (!isPlayingRef.current) break;

        const hasNext = advanceToNext();
        if (!hasNext) {
          // 마지막 항목이면 advanceToNext가 이미 currentIndex를 0으로 설정함
          idx = 0;
        } else {
          idx++;
        }
      }

      resetPlayback();
    } catch (error) {
      resetPlayback();
      toast.error(formatErrorMessage(error as Error));
    } finally {
      isPlayingRef.current = false;
    }
  }, [
    affirmations,
    currentIndex,
    playbackStatus,
    voiceSettings,
    ttsProvider.activeProvider,
    hasTTSApiKey,
    getActiveApiKey,
    setPlaybackStatus,
    advanceToNext,
    resetPlayback,
  ]);

  // handlePlay ref 업데이트
  useEffect(() => {
    handlePlayRef.current = handlePlay;
  }, [handlePlay]);

  // 플레이리스트에서 선택 시 자동 재생
  useEffect(() => {
    if (playRequested) {
      clearPlayRequest();
      // 현재 재생 중이면 중지 후 새로 시작
      if (isPlayingRef.current) {
        stop();
        isPlayingRef.current = false;
      }
      // 약간의 딜레이 후 재생 시작
      setTimeout(() => handlePlayRef.current(), 50);
    }
  }, [playRequested, clearPlayRequest]);

  // 일시정지
  const handlePause = useCallback(() => {
    pause();
    setPlaybackStatus('paused');
  }, [setPlaybackStatus]);

  // handlePause ref (Media Session에서 사용)
  const handlePauseRef = useRef(handlePause);
  useEffect(() => {
    handlePauseRef.current = handlePause;
  }, [handlePause]);

  // 이전
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      if (playbackStatus !== 'idle') {
        stop();
        isPlayingRef.current = false;
      }
      setCurrentIndex(currentIndex - 1);
      if (playbackStatus === 'playing') {
        setTimeout(() => handlePlay(), 100);
      }
    }
  }, [currentIndex, playbackStatus, setCurrentIndex, handlePlay]);

  // 다음
  const handleNext = useCallback(() => {
    if (currentIndex < affirmations.length - 1) {
      if (playbackStatus !== 'idle') {
        stop();
        isPlayingRef.current = false;
      }
      setCurrentIndex(currentIndex + 1);
      if (playbackStatus === 'playing') {
        setTimeout(() => handlePlay(), 100);
      }
    }
  }, [currentIndex, affirmations.length, playbackStatus, setCurrentIndex, handlePlay]);

  // handlePrev, handleNext ref (Media Session에서 사용)
  const handlePrevRef = useRef(handlePrev);
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handlePrevRef.current = handlePrev;
    handleNextRef.current = handleNext;
  }, [handlePrev, handleNext]);

  // Media Session API 설정 (백그라운드 재생 지원)
  useEffect(() => {
    if (!isMediaSessionSupported || affirmations.length === 0) return;

    // 메타데이터 설정
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentAffirmation?.text || '확언',
      artist: '믿음 변화기',
      album: `${currentIndex + 1} / ${affirmations.length}`,
    });

    // 재생 상태 업데이트
    navigator.mediaSession.playbackState =
      playbackStatus === 'playing' ? 'playing' :
      playbackStatus === 'paused' ? 'paused' : 'none';

    // 액션 핸들러 등록
    navigator.mediaSession.setActionHandler('play', () => {
      handlePlayRef.current();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      handlePauseRef.current();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      handlePrevRef.current();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      handleNextRef.current();
    });

    // 정리
    return () => {
      if (isMediaSessionSupported) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [affirmations.length, currentIndex, currentAffirmation?.text, playbackStatus]);

  // 확언이 없으면 렌더링하지 않음
  if (affirmations.length === 0) {
    return null;
  }

  return (
    <div className="player-bar">
      <div className="player-bar__content">
        {/* 왼쪽: 컨트롤 버튼 */}
        <div className="player-bar__controls">
          <button
            className="player-bar__btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="이전"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            className="player-bar__btn player-bar__btn--play"
            onClick={playbackStatus === 'playing' ? handlePause : handlePlay}
            aria-label={playbackStatus === 'playing' ? '일시정지' : '재생'}
          >
            {playbackStatus === 'playing' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="3" width="5" height="18" rx="1.5" />
                <rect x="14" y="3" width="5" height="18" rx="1.5" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 3.5v17a1 1 0 001.5.87l14-8.5a1 1 0 000-1.74l-14-8.5A1 1 0 006 3.5z" />
              </svg>
            )}
          </button>

          <button
            className="player-bar__btn"
            onClick={handleNext}
            disabled={currentIndex === affirmations.length - 1}
            aria-label="다음"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* 가운데: 현재 재생 중인 확언 */}
        <div className={`player-bar__info ${playbackStatus === 'playing' ? 'player-bar__info--playing' : ''}`}>
          <span className="player-bar__text">
            {currentAffirmation?.text || '확언을 선택하세요'}
          </span>
        </div>

        {/* 오른쪽: 트랙 정보 */}
        <div className="player-bar__track">
          {currentIndex + 1} / {affirmations.length}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useRef, useEffect } from 'react';
import { useAffirmationStore, useSettingsStore } from '../store';
import { speakText, pause, resume, stop, ttsManager } from '../services';
import './PlayerBar.css';

export function PlayerBar() {
  const {
    affirmations,
    currentIndex,
    playbackStatus,
    setCurrentIndex,
    advanceToNext,
    setPlaybackStatus,
    resetPlayback,
  } = useAffirmationStore();

  const {
    voiceSettings,
    ttsProvider,
    getActiveApiKey,
    hasTTSApiKey,
  } = useSettingsStore();

  const isPlayingRef = useRef(false);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
    };
  }, []);

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

      while (isPlayingRef.current && idx < affirmations.length) {
        const affirmation = affirmations[idx];

        await new Promise<void>((resolve, reject) => {
          speakText(affirmation.text, {
            settings: voiceSettings,
            onComplete: () => resolve(),
            onError: (err) => reject(err),
          });
        });

        if (!isPlayingRef.current) break;

        const hasNext = advanceToNext();
        if (!hasNext) {
          break;
        }
        idx++;
      }

      resetPlayback();
    } catch {
      resetPlayback();
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

  // 일시정지
  const handlePause = useCallback(() => {
    pause();
    setPlaybackStatus('paused');
  }, [setPlaybackStatus]);

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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="3" width="5" height="18" rx="1.5" />
                <rect x="14" y="3" width="5" height="18" rx="1.5" />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
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
        <div className="player-bar__info">
          <span className="player-bar__text">
            {currentAffirmation?.text || '확언을 선택하세요'}
          </span>
          {playbackStatus === 'playing' && (
            <div className="player-bar__wave" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        {/* 오른쪽: 트랙 정보 */}
        <div className="player-bar__track">
          {currentIndex + 1} / {affirmations.length}
        </div>
      </div>
    </div>
  );
}

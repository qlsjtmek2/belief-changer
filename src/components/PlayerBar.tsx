import { useCallback, useRef, useEffect } from 'react';
import { useAffirmationStore, useSettingsStore } from '../store';
import { speakText, pause, resume, stop, ttsManager } from '../services';
import './PlayerBar.css';

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

        const hasNext = advanceToNext();
        if (!hasNext) {
          // 마지막 항목이면 advanceToNext가 이미 currentIndex를 0으로 설정함
          idx = 0;
        } else {
          idx++;
        }
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

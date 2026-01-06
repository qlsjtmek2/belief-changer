import { useState, useCallback, useRef } from 'react';
import { Button, Input, PlaylistPanel } from '../components';
import { useAffirmationStore, useSettingsStore } from '../store';
import { generateAffirmations, speakText, pause, resume, stop, ttsManager } from '../services';
import './HomePage.css';

interface HomePageProps {
  onNavigateToSettings: () => void;
}

export function HomePage({ onNavigateToSettings }: HomePageProps) {
  const [inputText, setInputText] = useState('');
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPlayingRef = useRef(false);

  // Stores
  const {
    affirmations,
    currentIndex,
    playbackStatus,
    addAffirmations,
    deleteAffirmation,
    reorder,
    setCurrentIndex,
    advanceToNext,
    setPlaybackStatus,
    resetPlayback,
  } = useAffirmationStore();

  const {
    geminiApiKey,
    userName,
    voiceSettings,
    ttsProvider,
    geminiSettings,
    hasApiKey,
    getActiveApiKey,
    hasTTSApiKey,
  } = useSettingsStore();

  const isEmpty = affirmations.length === 0;

  // 확언 변형 생성
  const handleGenerate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !hasApiKey()) {
      setError('확언을 입력하고 API 키를 설정해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedTexts = await generateAffirmations(geminiApiKey, {
        affirmation: trimmed,
        userName: userName || '사용자',
        count,
        geminiSettings,
      });

      if (generatedTexts.length > 0) {
        addAffirmations(generatedTexts);
        setInputText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '확언 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // 연속 재생
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
      setError(
        `${ttsProvider.activeProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} API 키를 설정해주세요.`
      );
      return;
    }

    setPlaybackStatus('playing');
    setError(null);
    isPlayingRef.current = true;

    try {
      await ttsManager.setProvider(ttsProvider.activeProvider, {
        apiKey: getActiveApiKey(),
        voiceSettings,
      });

      // 현재 확언부터 끝까지 연속 재생
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

        // 다음 확언으로 이동
        const hasNext = advanceToNext();
        if (!hasNext) {
          break;
        }
        idx++;
      }

      resetPlayback();
    } catch (err) {
      if (isPlayingRef.current) {
        setError(err instanceof Error ? err.message : 'TTS 재생에 실패했습니다.');
      }
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

  const handlePause = useCallback(() => {
    pause();
    setPlaybackStatus('paused');
  }, [setPlaybackStatus]);

  const handleStop = useCallback(() => {
    isPlayingRef.current = false;
    stop();
    resetPlayback();
  }, [resetPlayback]);

  // 확언 선택
  const handleSelect = useCallback(
    (index: number) => {
      if (playbackStatus !== 'idle') {
        handleStop();
      }
      setCurrentIndex(index);
    },
    [playbackStatus, handleStop, setCurrentIndex]
  );

  // 확언 삭제
  const handleDelete = useCallback(
    (id: string) => {
      const deletingIndex = affirmations.findIndex((a) => a.id === id);
      const isPlayingDeleted =
        deletingIndex === currentIndex && playbackStatus !== 'idle';

      if (isPlayingDeleted) {
        handleStop();
      }

      deleteAffirmation(id);
    },
    [affirmations, currentIndex, playbackStatus, handleStop, deleteAffirmation]
  );

  // 빈 상태 UI
  if (isEmpty && !isGenerating) {
    return (
      <div className="home-page home-page--empty">
        <div className="home-page__bg" aria-hidden="true">
          <div className="home-page__orb home-page__orb--1" />
          <div className="home-page__orb home-page__orb--2" />
          <div className="home-page__orb home-page__orb--3" />
        </div>

        <button
          type="button"
          className="home-page__settings-btn home-page__settings-btn--corner"
          onClick={onNavigateToSettings}
          aria-label="설정"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <div className="home-page__center">
          <div className="home-page__brand">
            <h1 className="home-page__logo">Belief Changer</h1>
            <p className="home-page__tagline">당신의 확언을 다양하게 변형해드립니다</p>
          </div>

          <div className="home-page__search-box">
            <Input
              placeholder="확언을 입력하세요... 예: 나는 소중하다"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              className="home-page__search-input"
            />

            <div className="home-page__count-selector">
              <span className="home-page__count-label">변형 개수</span>
              <div className="home-page__count-buttons">
                {[1, 2, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`home-page__count-btn ${count === n ? 'home-page__count-btn--active' : ''}`}
                    onClick={() => setCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGenerate}
              disabled={!inputText.trim() || !hasApiKey()}
              isLoading={isGenerating}
            >
              확언 생성하기
            </Button>

            {!hasApiKey() && (
              <p className="home-page__api-hint">
                확언 생성을 위해{' '}
                <button type="button" className="home-page__link" onClick={onNavigateToSettings}>
                  설정
                </button>
                에서 API 키를 입력해주세요.
              </p>
            )}
          </div>

          {error && (
            <div className="home-page__error home-page__error--centered" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="home-page__error-close"
                onClick={() => setError(null)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 플레이리스트 모드 UI
  return (
    <div className="home-page home-page--playlist">
      <div className="home-page__bg" aria-hidden="true">
        <div className="home-page__orb home-page__orb--1" />
        <div className="home-page__orb home-page__orb--2" />
      </div>

      <button
        type="button"
        className="home-page__settings-btn home-page__settings-btn--corner"
        onClick={onNavigateToSettings}
        aria-label="설정"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      <div className="home-page__container">
        <section className="home-page__input-section">
          <div className="home-page__input-row">
            <Input
              placeholder="새 확언 입력..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
            />
            <div className="home-page__count-compact">
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="home-page__count-select"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!inputText.trim() || !hasApiKey() || isGenerating}
              isLoading={isGenerating}
            >
              생성
            </Button>
          </div>
        </section>

        {error && (
          <div className="home-page__error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button
              type="button"
              className="home-page__error-close"
              onClick={() => setError(null)}
              aria-label="에러 닫기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <PlaylistPanel
          affirmations={affirmations}
          currentIndex={currentIndex}
          playbackStatus={playbackStatus}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onReorder={reorder}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}

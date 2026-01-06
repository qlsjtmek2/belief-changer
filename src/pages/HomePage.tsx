import { useState, useCallback, useRef } from 'react';
import { Button, Input, PlaylistPanel } from '../components';
import { useDialogueStore, useSettingsStore } from '../store';
import { generateDialogue, speakDialogue, pause, resume, stop, ttsManager } from '../services';
import type { RawDialogueLine } from '../types';
import './HomePage.css';

interface HomePageProps {
  onNavigateToSettings: () => void;
}

interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
}

export function HomePage({ onNavigateToSettings }: HomePageProps) {
  const [affirmationText, setAffirmationText] = useState('');
  const [dialogueCount, setDialogueCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPlayingRef = useRef(false);

  // Stores
  const {
    dialogues,
    currentDialogueIndex,
    playbackStatus,
    addDialogues,
    deleteDialogue,
    reorderDialogues,
    setCurrentDialogue,
    advanceToNextDialogue,
    setPlaybackStatus,
    setCurrentLineIndex,
    resetPlayback,
  } = useDialogueStore();

  const {
    geminiApiKey,
    userName,
    voiceSettings,
    ttsProvider,
    geminiSettings,
    hasApiKey,
    getActiveApiKey,
    hasTTSApiKey,
    getSpeakerVoiceMap,
  } = useSettingsStore();

  const isEmpty = dialogues.length === 0;

  // N개 대화 생성
  const handleGenerate = async () => {
    const trimmed = affirmationText.trim();
    if (!trimmed || !hasApiKey()) {
      setError('확언을 입력하고 API 키를 설정해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ total: dialogueCount, completed: 0, failed: 0 });

    try {
      const promises = Array(dialogueCount)
        .fill(null)
        .map(() =>
          generateDialogue(geminiApiKey, {
            affirmation: trimmed,
            userName: userName || '사용자',
            speakerCount: 3,
            geminiSettings,
          })
        );

      const results = await Promise.allSettled(promises);

      const successfulDialogues: RawDialogueLine[][] = [];
      let completed = 0;
      let failed = 0;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successfulDialogues.push(result.value);
          completed++;
        } else {
          failed++;
        }
        setGenerationProgress({ total: dialogueCount, completed, failed });
      }

      if (successfulDialogues.length > 0) {
        addDialogues(trimmed, successfulDialogues);
        setAffirmationText('');
      }

      if (failed > 0) {
        setError(`${failed}개의 대화 생성에 실패했습니다.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '대화 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // 재생 (연속 재생)
  const handlePlay = useCallback(async () => {
    if (dialogues.length === 0) return;

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
    setCurrentLineIndex(0);
    setError(null);
    isPlayingRef.current = true;

    try {
      await ttsManager.setProvider(ttsProvider.activeProvider, {
        apiKey: getActiveApiKey(),
        voiceSettings,
      });

      const speakerVoiceMap = getSpeakerVoiceMap(ttsProvider.activeProvider);

      // 현재 대화부터 끝까지 연속 재생
      let currentIndex = currentDialogueIndex;

      while (isPlayingRef.current && currentIndex < dialogues.length) {
        const dialogue = dialogues[currentIndex];

        await new Promise<void>((resolve, reject) => {
          speakDialogue(dialogue.lines, {
            settings: voiceSettings,
            speakerVoiceMap,
            loop: false,
            onLineStart: (index) => setCurrentLineIndex(index),
            onComplete: () => resolve(),
            onError: (err) => reject(err),
          });
        });

        if (!isPlayingRef.current) break;

        // 다음 대화로 이동
        const hasNext = advanceToNextDialogue();
        if (!hasNext) {
          // 마지막 대화 완료
          break;
        }
        currentIndex++;
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
    dialogues,
    currentDialogueIndex,
    playbackStatus,
    voiceSettings,
    ttsProvider.activeProvider,
    hasTTSApiKey,
    getActiveApiKey,
    getSpeakerVoiceMap,
    setPlaybackStatus,
    setCurrentLineIndex,
    advanceToNextDialogue,
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

  // 대화 선택
  const handleSelectDialogue = useCallback(
    (index: number) => {
      if (playbackStatus !== 'idle') {
        handleStop();
      }
      setCurrentDialogue(index);
    },
    [playbackStatus, handleStop, setCurrentDialogue]
  );

  // 대화 삭제
  const handleDeleteDialogue = useCallback(
    (id: string) => {
      const deletingIndex = dialogues.findIndex((d) => d.id === id);
      const isPlayingDeleted =
        deletingIndex === currentDialogueIndex && playbackStatus !== 'idle';

      if (isPlayingDeleted) {
        handleStop();
      }

      deleteDialogue(id);
    },
    [dialogues, currentDialogueIndex, playbackStatus, handleStop, deleteDialogue]
  );

  // 빈 상태 UI (검색 사이트 스타일)
  if (isEmpty && !isGenerating) {
    return (
      <div className="home-page home-page--empty">
        {/* Background Effects */}
        <div className="home-page__bg" aria-hidden="true">
          <div className="home-page__orb home-page__orb--1" />
          <div className="home-page__orb home-page__orb--2" />
          <div className="home-page__orb home-page__orb--3" />
        </div>

        {/* Settings Button */}
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

        {/* Centered Content */}
        <div className="home-page__center">
          <div className="home-page__brand">
            <h1 className="home-page__logo">Belief Changer</h1>
            <p className="home-page__tagline">당신의 확언을 대화로 바꿔드립니다</p>
          </div>

          <div className="home-page__search-box">
            <Input
              placeholder="확언을 입력하세요... 예: 나는 매일 운동을 즐긴다"
              value={affirmationText}
              onChange={(e) => setAffirmationText(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              className="home-page__search-input"
            />

            <div className="home-page__count-selector">
              <span className="home-page__count-label">대화 개수</span>
              <div className="home-page__count-buttons">
                {[1, 2, 3, 5, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`home-page__count-btn ${dialogueCount === count ? 'home-page__count-btn--active' : ''}`}
                    onClick={() => setDialogueCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGenerate}
              disabled={!affirmationText.trim() || !hasApiKey()}
              isLoading={isGenerating}
            >
              대화 생성하기
            </Button>

            {!hasApiKey() && (
              <p className="home-page__api-hint">
                대화 생성을 위해{' '}
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
      {/* Background Effects */}
      <div className="home-page__bg" aria-hidden="true">
        <div className="home-page__orb home-page__orb--1" />
        <div className="home-page__orb home-page__orb--2" />
      </div>

      {/* Settings Button */}
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

      {/* Main Content */}
      <div className="home-page__container">
        {/* Input Section */}
        <section className="home-page__input-section">
          <div className="home-page__input-row">
            <Input
              placeholder="새 확언 입력..."
              value={affirmationText}
              onChange={(e) => setAffirmationText(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
            />
            <div className="home-page__count-compact">
              <select
                value={dialogueCount}
                onChange={(e) => setDialogueCount(Number(e.target.value))}
                className="home-page__count-select"
              >
                {[1, 2, 3, 5, 10].map((count) => (
                  <option key={count} value={count}>
                    {count}개
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!affirmationText.trim() || !hasApiKey() || isGenerating}
              isLoading={isGenerating}
            >
              생성
            </Button>
          </div>

          {/* 생성 진행률 */}
          {generationProgress && (
            <div className="home-page__progress">
              <div className="home-page__progress-bar">
                <div
                  className="home-page__progress-fill"
                  style={{
                    width: `${((generationProgress.completed + generationProgress.failed) / generationProgress.total) * 100}%`,
                  }}
                />
              </div>
              <span className="home-page__progress-text">
                {generationProgress.completed}/{generationProgress.total} 생성 완료
                {generationProgress.failed > 0 && ` (${generationProgress.failed} 실패)`}
              </span>
            </div>
          )}
        </section>

        {/* Error Message */}
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

        {/* Playlist Panel */}
        <PlaylistPanel
          dialogues={dialogues}
          currentIndex={currentDialogueIndex}
          playbackStatus={playbackStatus}
          onSelect={handleSelectDialogue}
          onDelete={handleDeleteDialogue}
          onReorder={reorderDialogues}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}

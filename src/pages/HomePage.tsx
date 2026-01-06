import { useState, useCallback } from 'react';
import { Button, Input, AffirmationCard, DialoguePlayer } from '../components';
import { useAffirmationStore, useDialogueStore, useSettingsStore } from '../store';
import { generateDialogue, speakDialogue, pause, resume, stop } from '../services';
import './HomePage.css';

interface HomePageProps {
  onNavigateToSettings: () => void;
}

export function HomePage({ onNavigateToSettings }: HomePageProps) {
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stores
  const {
    affirmations,
    selectedId,
    addAffirmation,
    updateAffirmation,
    deleteAffirmation,
    selectAffirmation,
  } = useAffirmationStore();

  const {
    playbackStatus,
    currentLineIndex,
    addDialogue,
    setCurrentDialogue,
    getCurrentDialogue,
    setPlaybackStatus,
    setCurrentLineIndex,
    resetPlayback,
  } = useDialogueStore();

  const { geminiApiKey, userName, voiceSettings, hasApiKey } = useSettingsStore();

  const currentDialogue = getCurrentDialogue();
  const selectedAffirmation = affirmations.find((a) => a.id === selectedId);

  // 확언 추가
  const handleAddAffirmation = () => {
    const trimmed = newAffirmation.trim();
    if (!trimmed) return;

    addAffirmation(trimmed);
    setNewAffirmation('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddAffirmation();
    }
  };

  // 대화 생성
  const handleGenerateDialogue = async () => {
    if (!selectedAffirmation || !hasApiKey()) {
      setError('확언을 선택하고 API 키를 설정해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const lines = await generateDialogue(geminiApiKey, {
        affirmation: selectedAffirmation.text,
        userName: userName || '사용자',
        speakerCount: 3,
      });

      const dialogue = addDialogue(selectedAffirmation.id, lines);
      setCurrentDialogue(dialogue.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대화 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // TTS 재생
  const handlePlay = useCallback(async () => {
    if (!currentDialogue) return;

    if (playbackStatus === 'paused') {
      resume();
      setPlaybackStatus('playing');
      return;
    }

    setPlaybackStatus('playing');
    setCurrentLineIndex(0);

    try {
      await speakDialogue(currentDialogue.lines, {
        settings: voiceSettings,
        onLineStart: (index) => setCurrentLineIndex(index),
        onComplete: () => resetPlayback(),
        onError: () => resetPlayback(),
      });
    } catch {
      resetPlayback();
    }
  }, [currentDialogue, playbackStatus, voiceSettings, setPlaybackStatus, setCurrentLineIndex, resetPlayback]);

  const handlePause = useCallback(() => {
    pause();
    setPlaybackStatus('paused');
  }, [setPlaybackStatus]);

  const handleStop = useCallback(() => {
    stop();
    resetPlayback();
  }, [resetPlayback]);

  return (
    <div className="home-page">
      {/* Background Effects */}
      <div className="home-page__bg" aria-hidden="true">
        <div className="home-page__orb home-page__orb--1" />
        <div className="home-page__orb home-page__orb--2" />
      </div>

      {/* Header */}
      <header className="home-page__header">
        <div className="home-page__title-group">
          <h1 className="home-page__title">Belief Changer</h1>
          <p className="home-page__subtitle">당신의 확언을 대화로</p>
        </div>
        <button
          type="button"
          className="home-page__settings-btn"
          onClick={onNavigateToSettings}
          aria-label="설정"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="home-page__main">
        {/* Input Section */}
        <section className="home-page__input-section">
          <div className="home-page__input-wrapper">
            <Input
              placeholder="새로운 확언을 입력하세요..."
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
            />
            <Button
              variant="primary"
              onClick={handleAddAffirmation}
              disabled={!newAffirmation.trim()}
            >
              추가
            </Button>
          </div>
          {!hasApiKey() && (
            <p className="home-page__api-hint">
              대화 생성을 위해{' '}
              <button type="button" className="home-page__link" onClick={onNavigateToSettings}>
                설정
              </button>
              에서 API 키를 입력해주세요.
            </p>
          )}
        </section>

        {/* Error Message */}
        {error && (
          <div className="home-page__error" role="alert">
            <svg className="home-page__error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="home-page__error-text">{error}</span>
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

        {/* Two Column Layout */}
        <div className="home-page__content">
          {/* Affirmation List */}
          <section className="home-page__affirmations">
            <h2 className="home-page__section-title">나의 확언</h2>
            {affirmations.length === 0 ? (
              <div className="home-page__empty">
                <p>아직 확언이 없습니다.</p>
                <p className="home-page__empty-hint">위에서 새로운 확언을 추가해보세요.</p>
              </div>
            ) : (
              <div className="home-page__card-list">
                {affirmations.map((affirmation) => (
                  <AffirmationCard
                    key={affirmation.id}
                    affirmation={affirmation}
                    isSelected={affirmation.id === selectedId}
                    onSelect={selectAffirmation}
                    onEdit={updateAffirmation}
                    onDelete={deleteAffirmation}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Dialogue Section */}
          <section className="home-page__dialogue">
            <h2 className="home-page__section-title">대화 재생</h2>

            {selectedAffirmation ? (
              <div className="home-page__dialogue-content">
                <div className="home-page__selected-affirmation">
                  <span className="home-page__selected-label">선택된 확언</span>
                  <p className="home-page__selected-text">{selectedAffirmation.text}</p>
                </div>

                {!currentDialogue || currentDialogue.affirmationId !== selectedId ? (
                  isGenerating ? (
                    <div className="home-page__loading">
                      <div className="home-page__loading-header">
                        <div className="home-page__loading-spinner" />
                        <span>AI가 대화를 생성하고 있습니다...</span>
                      </div>
                      <div className="home-page__skeleton">
                        <div className="home-page__skeleton-line home-page__skeleton-line--short" />
                        <div className="home-page__skeleton-line" />
                        <div className="home-page__skeleton-line home-page__skeleton-line--medium" />
                        <div className="home-page__skeleton-line home-page__skeleton-line--short" />
                        <div className="home-page__skeleton-line" />
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleGenerateDialogue}
                      disabled={!hasApiKey()}
                    >
                      대화 생성하기
                    </Button>
                  )
                ) : (
                  <DialoguePlayer
                    lines={currentDialogue.lines}
                    currentLineIndex={currentLineIndex}
                    playbackStatus={playbackStatus}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                  />
                )}
              </div>
            ) : (
              <div className="home-page__empty">
                <p>확언을 선택해주세요.</p>
                <p className="home-page__empty-hint">왼쪽에서 확언을 클릭하면 대화를 생성할 수 있습니다.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

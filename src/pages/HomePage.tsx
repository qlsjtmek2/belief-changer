import { useState, useCallback, useRef } from 'react';
import { Button, Input, AffirmationCard, DialoguePlayer, DialogueList } from '../components';
import { useAffirmationStore, useDialogueStore, useSettingsStore } from '../store';
import { generateDialogue, speakDialogue, pause, resume, stop, ttsManager } from '../services';
import type { PlaylistMode } from '../types';
import './HomePage.css';

interface HomePageProps {
  onNavigateToSettings: () => void;
}

export function HomePage({ onNavigateToSettings }: HomePageProps) {
  const [newAffirmation, setNewAffirmation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isPlayingAllRef = useRef(false);

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
    dialogues,
    playbackStatus,
    currentLineIndex,
    playlistMode,
    currentPlaylistIndex,
    addDialogue,
    deleteDialogue,
    deleteLine,
    reorderLines,
    setCurrentDialogue,
    getCurrentDialogue,
    getDialoguesByAffirmation,
    setPlaylistMode,
    advancePlaylist,
    setPlaybackStatus,
    setCurrentLineIndex,
    resetPlayback,
    resetPlaylist,
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

  const currentDialogue = getCurrentDialogue();
  const selectedAffirmation = affirmations.find((a) => a.id === selectedId);
  const selectedDialogues = selectedId ? getDialoguesByAffirmation(selectedId) : [];

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
        geminiSettings,
      });

      const dialogue = addDialogue(selectedAffirmation.id, lines);
      setCurrentDialogue(dialogue.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대화 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 개별 대화 재생
  const playSingleDialogue = useCallback(async () => {
    if (!currentDialogue) return;

    // 일시정지 상태면 재개
    if (playbackStatus === 'paused') {
      resume();
      setPlaybackStatus('playing');
      return;
    }

    // TTS API 키 확인 (WebSpeech 제외)
    if (!hasTTSApiKey()) {
      setError(`${ttsProvider.activeProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} API 키를 설정해주세요.`);
      return;
    }

    setPlaybackStatus('playing');
    setCurrentLineIndex(0);
    setError(null);

    try {
      await ttsManager.setProvider(ttsProvider.activeProvider, {
        apiKey: getActiveApiKey(),
        voiceSettings,
      });

      const speakerVoiceMap = getSpeakerVoiceMap(ttsProvider.activeProvider);

      await speakDialogue(currentDialogue.lines, {
        settings: voiceSettings,
        speakerVoiceMap,
        loop: false,
        onLineStart: (index) => setCurrentLineIndex(index),
        onComplete: () => resetPlayback(),
        onError: (err) => {
          setError(err.message);
          resetPlayback();
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS 재생에 실패했습니다.');
      resetPlayback();
    }
  }, [
    currentDialogue,
    playbackStatus,
    voiceSettings,
    ttsProvider.activeProvider,
    hasTTSApiKey,
    getActiveApiKey,
    getSpeakerVoiceMap,
    setPlaybackStatus,
    setCurrentLineIndex,
    resetPlayback,
  ]);

  // 전체 대화 연속 재생
  const playAllDialogues = useCallback(async () => {
    if (dialogues.length === 0) return;

    if (playbackStatus === 'paused') {
      resume();
      setPlaybackStatus('playing');
      return;
    }

    if (!hasTTSApiKey()) {
      setError(`${ttsProvider.activeProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} API 키를 설정해주세요.`);
      return;
    }

    setPlaylistMode('all');
    setPlaybackStatus('playing');
    setCurrentLineIndex(0);
    setError(null);
    isPlayingAllRef.current = true;

    try {
      await ttsManager.setProvider(ttsProvider.activeProvider, {
        apiKey: getActiveApiKey(),
        voiceSettings,
      });

      const speakerVoiceMap = getSpeakerVoiceMap(ttsProvider.activeProvider);

      // 전체 대화 순회
      for (let i = 0; i < dialogues.length && isPlayingAllRef.current; i++) {
        const dialogue = dialogues[i];
        setCurrentDialogue(dialogue.id);

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

        if (i < dialogues.length - 1 && isPlayingAllRef.current) {
          advancePlaylist();
        }
      }

      resetPlayback();
      resetPlaylist();
    } catch (err) {
      if (isPlayingAllRef.current) {
        setError(err instanceof Error ? err.message : 'TTS 재생에 실패했습니다.');
      }
      resetPlayback();
      resetPlaylist();
    } finally {
      isPlayingAllRef.current = false;
    }
  }, [
    dialogues,
    playbackStatus,
    voiceSettings,
    ttsProvider.activeProvider,
    hasTTSApiKey,
    getActiveApiKey,
    getSpeakerVoiceMap,
    setPlaylistMode,
    setPlaybackStatus,
    setCurrentLineIndex,
    setCurrentDialogue,
    advancePlaylist,
    resetPlayback,
    resetPlaylist,
  ]);

  // 재생 핸들러 (모드에 따라 분기)
  const handlePlay = useCallback(() => {
    if (playlistMode === 'all') {
      playAllDialogues();
    } else {
      playSingleDialogue();
    }
  }, [playlistMode, playAllDialogues, playSingleDialogue]);

  const handlePause = useCallback(() => {
    pause();
    setPlaybackStatus('paused');
  }, [setPlaybackStatus]);

  const handleStop = useCallback(() => {
    isPlayingAllRef.current = false;
    stop();
    resetPlayback();
    resetPlaylist();
  }, [resetPlayback, resetPlaylist]);

  // 모드 변경 핸들러
  const handleModeChange = (mode: PlaylistMode) => {
    if (playbackStatus !== 'idle') {
      handleStop();
    }
    setPlaylistMode(mode);
    setIsEditMode(false);

    if (mode === 'all' && dialogues.length > 0) {
      setCurrentDialogue(dialogues[0].id);
    } else if (mode === 'single' && selectedDialogues.length > 0) {
      setCurrentDialogue(selectedDialogues[0].id);
    }
  };

  // 라인 삭제 핸들러
  const handleDeleteLine = useCallback((lineId: string) => {
    if (currentDialogue) {
      deleteLine(currentDialogue.id, lineId);
    }
  }, [currentDialogue, deleteLine]);

  // 라인 순서 변경 핸들러
  const handleReorderLines = useCallback((lineIds: string[]) => {
    if (currentDialogue) {
      reorderLines(currentDialogue.id, lineIds);
    }
  }, [currentDialogue, reorderLines]);

  // 대화 삭제 핸들러
  const handleDeleteDialogue = useCallback((dialogueId: string) => {
    deleteDialogue(dialogueId);
    if (selectedDialogues.length > 1) {
      const remaining = selectedDialogues.filter((d) => d.id !== dialogueId);
      if (remaining.length > 0) {
        setCurrentDialogue(remaining[0].id);
      }
    }
  }, [deleteDialogue, selectedDialogues, setCurrentDialogue]);

  // 확언 삭제 핸들러 (재생 중이면 TTS 중지)
  const handleDeleteAffirmation = useCallback((id: string) => {
    // 삭제할 확언에 연결된 대화가 현재 재생 중인지 확인
    const dialoguesForAffirmation = getDialoguesByAffirmation(id);
    const isPlayingDeletedDialogue = dialoguesForAffirmation.some(
      (d) => d.id === currentDialogue?.id && playbackStatus !== 'idle'
    );

    // 재생 중이면 먼저 정지
    if (isPlayingDeletedDialogue) {
      isPlayingAllRef.current = false;
      stop();
      resetPlayback();
      resetPlaylist();
    }

    // 확언 삭제 (연결된 대화도 함께 삭제됨 - affirmationStore에서 처리)
    deleteAffirmation(id);
  }, [
    getDialoguesByAffirmation,
    currentDialogue,
    playbackStatus,
    resetPlayback,
    resetPlaylist,
    deleteAffirmation,
  ]);

  // 플레이리스트 정보
  const playlistInfo = playlistMode === 'all' && dialogues.length > 0
    ? { current: currentPlaylistIndex + 1, total: dialogues.length }
    : undefined;

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
              placeholder="새로운 확언을 입력하세요... 예: 나는 운동을 좋아한다"
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

        {/* Mode Switch */}
        {dialogues.length > 0 && (
          <div className="home-page__mode-switch">
            <button
              type="button"
              className={`home-page__mode-btn ${playlistMode === 'single' ? 'home-page__mode-btn--active' : ''}`}
              onClick={() => handleModeChange('single')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              개별 재생
            </button>
            <button
              type="button"
              className={`home-page__mode-btn ${playlistMode === 'all' ? 'home-page__mode-btn--active' : ''}`}
              onClick={() => handleModeChange('all')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              전체 재생 ({dialogues.length}개)
            </button>
          </div>
        )}

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
                    onSelect={(id) => {
                      selectAffirmation(id);
                      if (playlistMode === 'single') {
                        const dialoguesForAffirmation = getDialoguesByAffirmation(id);
                        if (dialoguesForAffirmation.length > 0) {
                          setCurrentDialogue(dialoguesForAffirmation[0].id);
                        } else {
                          setCurrentDialogue(null);
                        }
                      }
                    }}
                    onEdit={updateAffirmation}
                    onDelete={handleDeleteAffirmation}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Dialogue Section */}
          <section className="home-page__dialogue">
            <div className="home-page__dialogue-header">
              <h2 className="home-page__section-title">
                {playlistMode === 'all' ? '전체 대화 재생' : '대화 재생'}
              </h2>
              {currentDialogue && playbackStatus === 'idle' && (
                <button
                  type="button"
                  className={`home-page__edit-toggle ${isEditMode ? 'home-page__edit-toggle--active' : ''}`}
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  편집
                </button>
              )}
            </div>

            {playlistMode === 'all' ? (
              // 전체 재생 모드
              <div className="home-page__dialogue-content">
                {dialogues.length === 0 ? (
                  <div className="home-page__empty">
                    <p>생성된 대화가 없습니다.</p>
                    <p className="home-page__empty-hint">확언을 선택하고 대화를 생성해보세요.</p>
                  </div>
                ) : currentDialogue ? (
                  <>
                    <div className="home-page__playlist-header">
                      <span className="home-page__playlist-badge">
                        전체 {dialogues.length}개 대화
                      </span>
                    </div>
                    <DialoguePlayer
                      lines={currentDialogue.lines}
                      currentLineIndex={currentLineIndex}
                      playbackStatus={playbackStatus}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onStop={handleStop}
                      editable={isEditMode}
                      onDeleteLine={handleDeleteLine}
                      onReorderLines={handleReorderLines}
                      playlistInfo={playlistInfo}
                    />
                  </>
                ) : null}
              </div>
            ) : selectedAffirmation ? (
              // 개별 재생 모드
              <div className="home-page__dialogue-content">
                <div className="home-page__selected-affirmation">
                  <span className="home-page__selected-label">선택된 확언</span>
                  <p className="home-page__selected-text">{selectedAffirmation.text}</p>
                </div>

                {selectedDialogues.length > 0 && (
                  <DialogueList
                    dialogues={selectedDialogues}
                    selectedDialogueId={currentDialogue?.id ?? null}
                    onSelect={setCurrentDialogue}
                    onDelete={handleDeleteDialogue}
                    onAddNew={handleGenerateDialogue}
                    isGenerating={isGenerating}
                  />
                )}

                {selectedDialogues.length === 0 ? (
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
                ) : currentDialogue && currentDialogue.affirmationId === selectedId ? (
                  <DialoguePlayer
                    lines={currentDialogue.lines}
                    currentLineIndex={currentLineIndex}
                    playbackStatus={playbackStatus}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                    editable={isEditMode}
                    onDeleteLine={handleDeleteLine}
                    onReorderLines={handleReorderLines}
                  />
                ) : null}
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

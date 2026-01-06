import { useState, useCallback, useEffect } from 'react';
import { Input, PlaylistPanel, Toast } from '../components';
import { useAffirmationStore, useSettingsStore } from '../store';
import { generateAffirmations, stop } from '../services';
import './HomePage.css';

interface HomePageProps {
  onNavigateToSettings: () => void;
}

export function HomePage({ onNavigateToSettings }: HomePageProps) {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Stores
  const {
    affirmations,
    currentIndex,
    playbackStatus,
    addAffirmations,
    updateAffirmation,
    deleteAffirmation,
    reorder,
    resetPlayback,
    selectAndPlay,
    isNewItem,
  } = useAffirmationStore();

  const {
    geminiApiKey,
    userName,
    geminiSettings,
    hasApiKey,
    aiGenerationEnabled,
    setAiGenerationEnabled,
    generationCount: count,
    setGenerationCount: setCount,
  } = useSettingsStore();

  const isEmpty = affirmations.length === 0;
  const showEmptyState = isEmpty && !isGenerating;

  // 전환 애니메이션 상태
  const [shouldShowPlaylist, setShouldShowPlaylist] = useState(!isEmpty);
  const [isExiting, setIsExiting] = useState(false);

  // 전환 효과 관리
  useEffect(() => {
    if (!showEmptyState && !shouldShowPlaylist) {
      // 빈 상태 → 플레이리스트: 즉시 표시
      setShouldShowPlaylist(true);
    } else if (showEmptyState && shouldShowPlaylist) {
      // 플레이리스트 → 빈 상태: exit 애니메이션 후 제거
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldShowPlaylist(false);
        setIsExiting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showEmptyState, shouldShowPlaylist]);

  // 확언 변형 생성 또는 직접 추가
  const handleGenerate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // AI 생성 OFF: 입력한 문장 그대로 추가
    if (!aiGenerationEnabled) {
      addAffirmations([trimmed]);
      setInputText('');
      setToastMessage('확언이 추가되었습니다');
      setToastVisible(true);
      return;
    }

    // AI 생성 ON: API 키 필요
    if (!hasApiKey()) {
      setError('API 키를 설정해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setInputText('');

    try {
      const generatedTexts = await generateAffirmations(geminiApiKey, {
        affirmation: trimmed,
        userName: userName || '사용자',
        count,
        geminiSettings,
      });

      if (generatedTexts.length > 0) {
        addAffirmations(generatedTexts);
        setToastMessage(`${generatedTexts.length}개의 확언이 추가되었습니다`);
        setToastVisible(true);
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

  // 확언 선택 (자동 재생)
  const handleSelect = useCallback(
    (index: number) => {
      if (playbackStatus !== 'idle') {
        stop();
      }
      selectAndPlay(index);
    },
    [playbackStatus, selectAndPlay]
  );

  // 확언 삭제
  const handleDelete = useCallback(
    (id: string) => {
      const deletingIndex = affirmations.findIndex((a) => a.id === id);
      const isPlayingDeleted =
        deletingIndex === currentIndex && playbackStatus !== 'idle';

      if (isPlayingDeleted) {
        stop();
        resetPlayback();
      }

      deleteAffirmation(id);
    },
    [affirmations, currentIndex, playbackStatus, deleteAffirmation, resetPlayback]
  );

  // CSS 클래스 결정
  const pageClasses = [
    'home-page',
    showEmptyState ? 'home-page--empty' : 'home-page--playlist',
  ].join(' ');

  const brandClasses = [
    'home-page__brand',
    !showEmptyState && 'home-page__brand--hidden',
  ].filter(Boolean).join(' ');

  const playlistAreaClasses = [
    'home-page__playlist-area',
    isExiting && 'home-page__playlist-area--exiting',
  ].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      <div className="home-page__bg" aria-hidden="true">
        <div className="home-page__orb home-page__orb--1" />
        <div className="home-page__orb home-page__orb--2" />
        {showEmptyState && <div className="home-page__orb home-page__orb--3" />}
      </div>

      <button
        type="button"
        className="home-page__settings-btn home-page__settings-btn--corner"
        onClick={onNavigateToSettings}
        aria-label="설정"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      <div className="home-page__center">
        {/* 브랜드 - 빈 상태에서만 표시 */}
        <div className={brandClasses}>
          <h1 className="home-page__logo">Belief Changer</h1>
          <p className="home-page__tagline">당신의 확언을 TTS로 반복 재생해드립니다</p>
        </div>

        {/* 입력창 - 항상 표시 */}
        <div className="home-page__search-box">
          <Input
            placeholder="확언을 입력하세요... 예: 나는 소중하다"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            className="home-page__search-input"
            suffix={
              <button
                type="button"
                className="home-page__add-btn"
                onClick={handleGenerate}
                disabled={!inputText.trim() || (aiGenerationEnabled && !hasApiKey()) || isGenerating}
                aria-label={aiGenerationEnabled ? '확언 생성' : '확언 추가'}
              >
                {isGenerating ? (
                  <span className="home-page__add-btn-spinner" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
            }
          />

          <div className="home-page__count-selector">
            {/* AI 생성 ON/OFF에 따라 개수 선택 표시/숨김 (애니메이션 적용) */}
            <div className={`home-page__count-content ${!aiGenerationEnabled ? 'home-page__count-content--hidden' : ''}`}>
              <span className="home-page__count-label">생성 개수</span>
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

            {/* AI 토글 스위치 - 항상 우측 끝에 고정 */}
            <button
              type="button"
              className={`home-page__ai-toggle ${aiGenerationEnabled ? 'home-page__ai-toggle--active' : ''}`}
              onClick={() => setAiGenerationEnabled(!aiGenerationEnabled)}
              aria-label={aiGenerationEnabled ? 'AI 생성 끄기' : 'AI 생성 켜기'}
              title={aiGenerationEnabled ? 'AI로 변형 생성' : '입력 그대로 추가'}
            >
              <span className="home-page__ai-toggle-label">AI</span>
              <span className="home-page__ai-toggle-switch">
                <span className="home-page__ai-toggle-knob" />
              </span>
            </button>
          </div>

          {aiGenerationEnabled && !hasApiKey() && (
            <p className="home-page__api-hint">
              확언 생성을 위해{' '}
              <button type="button" className="home-page__link" onClick={onNavigateToSettings}>
                설정
              </button>
              에서 API 키를 입력해주세요.
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
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
              aria-label="닫기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* 플레이리스트 - 확언이 있을 때만 표시 */}
        {shouldShowPlaylist && (
          <div className={playlistAreaClasses}>
            <PlaylistPanel
              affirmations={affirmations}
              currentIndex={currentIndex}
              playbackStatus={playbackStatus}
              isNewItem={isNewItem}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onUpdate={updateAffirmation}
              onReorder={reorder}
            />
          </div>
        )}
      </div>

      {/* 토스트 메시지 */}
      <Toast
        message={toastMessage || ''}
        isVisible={toastVisible}
        onClose={() => {
          setToastVisible(false);
          // 애니메이션(0.3s) 후 메시지 제거
          setTimeout(() => setToastMessage(null), 300);
        }}
      />
    </div>
  );
}

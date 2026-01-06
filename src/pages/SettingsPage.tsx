import { Button, Input } from '../components';
import { useSettingsStore } from '../store';
import './SettingsPage.css';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const {
    userName,
    geminiApiKey,
    voiceSettings,
    setUserName,
    setGeminiApiKey,
    updateVoiceSettings,
    resetVoiceSettings,
  } = useSettingsStore();

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-page__header">
        <button
          type="button"
          className="settings-page__back-btn"
          onClick={onBack}
          aria-label="뒤로 가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="settings-page__title">설정</h1>
        <div className="settings-page__spacer" />
      </header>

      {/* Content */}
      <main className="settings-page__main">
        {/* Profile Section */}
        <section className="settings-page__section">
          <h2 className="settings-page__section-title">프로필</h2>
          <div className="settings-page__card">
            <Input
              label="사용자 이름"
              placeholder="이름을 입력하세요"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              hint="대화 스크립트에서 사용될 이름입니다."
              fullWidth
            />
          </div>
        </section>

        {/* API Section */}
        <section className="settings-page__section">
          <h2 className="settings-page__section-title">API 설정</h2>
          <div className="settings-page__card">
            <div className="settings-page__input-group">
              <Input
                label="Gemini API 키"
                type="password"
                placeholder="API 키를 입력하세요"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                fullWidth
              />
              <p className="settings-page__hint">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-page__link"
                >
                  Google AI Studio
                </a>
                에서 API 키를 발급받을 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Voice Settings Section */}
        <section className="settings-page__section">
          <div className="settings-page__section-header">
            <h2 className="settings-page__section-title">음성 설정</h2>
            <Button variant="ghost" size="sm" onClick={resetVoiceSettings}>
              초기화
            </Button>
          </div>
          <div className="settings-page__card">
            {/* Rate */}
            <div className="settings-page__slider-group">
              <div className="settings-page__slider-header">
                <label htmlFor="voice-rate" className="settings-page__label">
                  속도
                </label>
                <span className="settings-page__value">{voiceSettings.rate.toFixed(1)}x</span>
              </div>
              <input
                id="voice-rate"
                type="range"
                className="settings-page__slider"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
              />
              <div className="settings-page__slider-labels">
                <span>느림</span>
                <span>빠름</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="settings-page__slider-group">
              <div className="settings-page__slider-header">
                <label htmlFor="voice-pitch" className="settings-page__label">
                  음높이
                </label>
                <span className="settings-page__value">{voiceSettings.pitch.toFixed(1)}</span>
              </div>
              <input
                id="voice-pitch"
                type="range"
                className="settings-page__slider"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
              />
              <div className="settings-page__slider-labels">
                <span>낮음</span>
                <span>높음</span>
              </div>
            </div>

            {/* Volume */}
            <div className="settings-page__slider-group">
              <div className="settings-page__slider-header">
                <label htmlFor="voice-volume" className="settings-page__label">
                  음량
                </label>
                <span className="settings-page__value">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
              <input
                id="voice-volume"
                type="range"
                className="settings-page__slider"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
              />
              <div className="settings-page__slider-labels">
                <span>작음</span>
                <span>큼</span>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="settings-page__section">
          <div className="settings-page__info">
            <p>모든 설정은 자동으로 저장됩니다.</p>
            <p className="settings-page__info-sub">API 키는 브라우저에 저장되며 외부로 전송되지 않습니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

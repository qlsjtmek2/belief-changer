import { useState, useEffect, useCallback } from 'react';
import { Button, Input } from '../components';
import { useSettingsStore } from '../store';
import { ttsManager, type TTSVoice } from '../services/tts';
import { DEFAULT_PROMPT_TEMPLATE } from '../utils/prompts';
import type { TTSProviderType } from '../types';
import './SettingsPage.css';

const SPEAKER_LABELS = ['화자 1', '화자 2', '화자 3'];

const GEMINI_MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: '최고 성능 (Preview)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '빠른 속도 + 고성능 (Preview)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '복잡한 추론' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '가성비 최고' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: '가장 빠름' },
];

interface SettingsPageProps {
  onBack: () => void;
}

const TTS_PROVIDERS: { id: TTSProviderType; name: string; description: string }[] = [
  { id: 'webspeech', name: 'Web Speech', description: '무료, 브라우저 내장' },
  { id: 'elevenlabs', name: 'ElevenLabs', description: '고품질 AI 음성' },
  { id: 'openai', name: 'OpenAI TTS', description: '자연스러운 음성' },
];

export function SettingsPage({ onBack }: SettingsPageProps) {
  const {
    userName,
    geminiApiKey,
    voiceSettings,
    ttsProvider,
    speakerVoices,
    geminiSettings,
    setUserName,
    setGeminiApiKey,
    updateVoiceSettings,
    resetVoiceSettings,
    setActiveProvider,
    setElevenLabsApiKey,
    setOpenAIApiKey,
    setSpeakerVoice,
    getActiveApiKey,
    setGeminiModel,
    setGeminiTemperature,
    setCustomPrompt,
    resetGeminiSettings,
  } = useSettingsStore();

  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Provider 변경 시 한국어 음성 목록 로드 (재생 중인 TTS를 중지하지 않음)
  const loadVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    try {
      const apiKey = getActiveApiKey();
      const voices = await ttsManager.getVoicesForProvider(
        ttsProvider.activeProvider,
        { apiKey, voiceSettings }
      );
      setAvailableVoices(voices);
    } catch (error) {
      console.warn('음성 목록 로드 실패:', error);
      setAvailableVoices([]);
    } finally {
      setIsLoadingVoices(false);
    }
  }, [ttsProvider.activeProvider, getActiveApiKey, voiceSettings]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  // 화자별 음성 선택 핸들러
  const handleSpeakerVoiceChange = (speakerIndex: number, voiceId: string) => {
    setSpeakerVoice(ttsProvider.activeProvider, String(speakerIndex), voiceId);
  };

  // 현재 Provider의 화자별 선택된 음성 ID 가져오기
  const getSelectedVoiceId = (speakerIndex: number): string => {
    return speakerVoices[ttsProvider.activeProvider]?.[String(speakerIndex)] ?? '';
  };

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

        {/* AI Generation Settings Section */}
        <section className="settings-page__section">
          <div className="settings-page__section-header">
            <h2 className="settings-page__section-title">AI 생성 설정</h2>
            <Button variant="ghost" size="sm" onClick={resetGeminiSettings}>
              초기화
            </Button>
          </div>
          <div className="settings-page__card">
            {/* Model Selection */}
            <div className="settings-page__input-group">
              <label htmlFor="gemini-model" className="settings-page__label">
                Gemini 모델
              </label>
              <select
                id="gemini-model"
                className="settings-page__select"
                value={geminiSettings.model}
                onChange={(e) => setGeminiModel(e.target.value)}
              >
                {GEMINI_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="settings-page__slider-group">
              <div className="settings-page__slider-header">
                <label htmlFor="temperature" className="settings-page__label">
                  창의성 (Temperature)
                </label>
                <span className="settings-page__value">{geminiSettings.temperature.toFixed(1)}</span>
              </div>
              <input
                id="temperature"
                type="range"
                className="settings-page__slider"
                min="0"
                max="2"
                step="0.1"
                value={geminiSettings.temperature}
                onChange={(e) => setGeminiTemperature(parseFloat(e.target.value))}
              />
              <div className="settings-page__slider-labels">
                <span>일관적</span>
                <span>창의적</span>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="settings-page__input-group">
              <label htmlFor="custom-prompt" className="settings-page__label">
                커스텀 프롬프트
              </label>
              <textarea
                id="custom-prompt"
                className="settings-page__textarea"
                rows={10}
                value={geminiSettings.customPrompt || DEFAULT_PROMPT_TEMPLATE}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              <div className="settings-page__prompt-footer">
                <p className="settings-page__hint">
                  사용 가능한 변수: {'{{affirmation}}'}, {'{{userName}}'}, {'{{speakerCount}}'}, {'{{minTurns}}'}, {'{{maxTurns}}'}
                </p>
                <button
                  type="button"
                  className="settings-page__restore-btn"
                  onClick={() => setCustomPrompt('')}
                  disabled={!geminiSettings.customPrompt}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  기본 프롬프트로 복구
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TTS Provider Section */}
        <section className="settings-page__section">
          <h2 className="settings-page__section-title">TTS 설정</h2>
          <div className="settings-page__card">
            {/* Provider Selection */}
            <div className="settings-page__provider-group">
              <span className="settings-page__label">음성 엔진</span>
              <div className="settings-page__provider-options">
                {TTS_PROVIDERS.map((provider) => (
                  <label
                    key={provider.id}
                    className={`settings-page__provider-option ${
                      ttsProvider.activeProvider === provider.id ? 'settings-page__provider-option--active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="tts-provider"
                      value={provider.id}
                      checked={ttsProvider.activeProvider === provider.id}
                      onChange={() => setActiveProvider(provider.id)}
                      className="settings-page__provider-radio"
                    />
                    <div className="settings-page__provider-content">
                      <span className="settings-page__provider-name">{provider.name}</span>
                      <span className="settings-page__provider-desc">{provider.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ElevenLabs API Key */}
            {ttsProvider.activeProvider === 'elevenlabs' && (
              <div className="settings-page__input-group">
                <Input
                  label="ElevenLabs API 키"
                  type="password"
                  placeholder="API 키를 입력하세요"
                  value={ttsProvider.elevenlabsApiKey}
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  fullWidth
                />
                <p className="settings-page__hint">
                  <a
                    href="https://elevenlabs.io/app/settings/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="settings-page__link"
                  >
                    ElevenLabs
                  </a>
                  에서 API 키를 발급받을 수 있습니다.
                </p>
              </div>
            )}

            {/* OpenAI API Key */}
            {ttsProvider.activeProvider === 'openai' && (
              <div className="settings-page__input-group">
                <Input
                  label="OpenAI API 키"
                  type="password"
                  placeholder="API 키를 입력하세요"
                  value={ttsProvider.openaiApiKey}
                  onChange={(e) => setOpenAIApiKey(e.target.value)}
                  fullWidth
                />
                <p className="settings-page__hint">
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="settings-page__link"
                  >
                    OpenAI Platform
                  </a>
                  에서 API 키를 발급받을 수 있습니다.
                </p>
              </div>
            )}

            {/* 화자별 음성 선택 */}
            <div className="settings-page__voice-selection">
              <span className="settings-page__label">화자별 음성</span>
              {isLoadingVoices ? (
                <div className="settings-page__voice-loading">음성 목록을 불러오는 중...</div>
              ) : availableVoices.length === 0 ? (
                <div className="settings-page__voice-empty">
                  {ttsProvider.activeProvider !== 'webspeech' && !getActiveApiKey()
                    ? 'API 키를 입력하면 음성 목록이 표시됩니다.'
                    : '사용 가능한 음성이 없습니다.'}
                </div>
              ) : (
                <div className="settings-page__voice-list">
                  {SPEAKER_LABELS.map((label, index) => (
                    <div key={index} className="settings-page__voice-item">
                      <label
                        htmlFor={`speaker-${index}`}
                        className="settings-page__voice-label"
                      >
                        {label}
                      </label>
                      <select
                        id={`speaker-${index}`}
                        className="settings-page__voice-select"
                        value={getSelectedVoiceId(index)}
                        onChange={(e) => handleSpeakerVoiceChange(index, e.target.value)}
                      >
                        <option value="">자동 선택</option>
                        {availableVoices.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <p className="settings-page__hint">
                대화 재생 시 각 화자에게 할당될 음성을 선택합니다.
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

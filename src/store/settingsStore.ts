import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, VoiceSettings, TTSProviderType, TTSProviderSettings, SelectedVoiceSettings, GeminiSettings } from '../types';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
};

const DEFAULT_TTS_PROVIDER_SETTINGS: TTSProviderSettings = {
  activeProvider: 'webspeech',
  elevenlabsApiKey: '',
  openaiApiKey: '',
};

const DEFAULT_SELECTED_VOICE: SelectedVoiceSettings = {
  webspeech: '',  // '' = 랜덤
  elevenlabs: '',
  openai: '',
};

const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  model: 'gemini-2.5-flash',
  temperature: 1.0,
  customPrompt: '',
};

interface SettingsState extends Settings {
  // AI 생성 활성화 여부
  aiGenerationEnabled: boolean;

  // 생성 개수
  generationCount: number;

  // TTS Provider 설정
  ttsProvider: TTSProviderSettings;

  // 선택된 음성 설정 (Provider별, '' = 랜덤)
  selectedVoice: SelectedVoiceSettings;

  // Gemini 설정
  geminiSettings: GeminiSettings;

  // Actions - 기존
  setUserName: (name: string) => void;
  setGeminiApiKey: (key: string) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  resetVoiceSettings: () => void;
  hasApiKey: () => boolean;
  setAiGenerationEnabled: (enabled: boolean) => void;
  setGenerationCount: (count: number) => void;

  // Actions - TTS Provider
  setActiveProvider: (provider: TTSProviderType) => void;
  setElevenLabsApiKey: (key: string) => void;
  setOpenAIApiKey: (key: string) => void;
  getActiveApiKey: () => string | undefined;
  hasTTSApiKey: (provider?: TTSProviderType) => boolean;

  // Actions - 음성 선택
  setSelectedVoice: (provider: TTSProviderType, voiceId: string) => void;
  getSelectedVoice: (provider?: TTSProviderType) => string;

  // Actions - Gemini 설정
  setGeminiModel: (model: string) => void;
  setGeminiTemperature: (temperature: number) => void;
  setCustomPrompt: (prompt: string) => void;
  resetGeminiSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: '',
      geminiApiKey: '',
      voiceSettings: DEFAULT_VOICE_SETTINGS,
      aiGenerationEnabled: true,
      generationCount: 3,
      ttsProvider: DEFAULT_TTS_PROVIDER_SETTINGS,
      selectedVoice: DEFAULT_SELECTED_VOICE,
      geminiSettings: DEFAULT_GEMINI_SETTINGS,

      setUserName: (name: string) => {
        set({ userName: name });
      },

      setGeminiApiKey: (key: string) => {
        set({ geminiApiKey: key });
      },

      updateVoiceSettings: (settings: Partial<VoiceSettings>) => {
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...settings },
        }));
      },

      resetVoiceSettings: () => {
        set({ voiceSettings: DEFAULT_VOICE_SETTINGS });
      },

      hasApiKey: () => {
        return get().geminiApiKey.trim().length > 0;
      },

      setAiGenerationEnabled: (enabled: boolean) => {
        set({ aiGenerationEnabled: enabled });
      },

      setGenerationCount: (count: number) => {
        set({ generationCount: count });
      },

      // TTS Provider 액션
      setActiveProvider: (provider: TTSProviderType) => {
        set((state) => ({
          ttsProvider: { ...state.ttsProvider, activeProvider: provider },
        }));
      },

      setElevenLabsApiKey: (key: string) => {
        set((state) => ({
          ttsProvider: { ...state.ttsProvider, elevenlabsApiKey: key },
        }));
      },

      setOpenAIApiKey: (key: string) => {
        set((state) => ({
          ttsProvider: { ...state.ttsProvider, openaiApiKey: key },
        }));
      },

      getActiveApiKey: () => {
        const { ttsProvider } = get();
        switch (ttsProvider.activeProvider) {
          case 'elevenlabs':
            return ttsProvider.elevenlabsApiKey || undefined;
          case 'openai':
            return ttsProvider.openaiApiKey || undefined;
          default:
            return undefined; // WebSpeech는 API 키 불필요
        }
      },

      hasTTSApiKey: (provider?: TTSProviderType) => {
        const { ttsProvider } = get();
        const targetProvider = provider ?? ttsProvider.activeProvider;

        switch (targetProvider) {
          case 'elevenlabs':
            return ttsProvider.elevenlabsApiKey.trim().length > 0;
          case 'openai':
            return ttsProvider.openaiApiKey.trim().length > 0;
          case 'webspeech':
          default:
            return true; // WebSpeech는 항상 사용 가능
        }
      },

      // 음성 선택 액션
      setSelectedVoice: (provider: TTSProviderType, voiceId: string) => {
        set((state) => ({
          selectedVoice: {
            ...state.selectedVoice,
            [provider]: voiceId,
          },
        }));
      },

      getSelectedVoice: (provider?: TTSProviderType) => {
        const state = get();
        const targetProvider = provider ?? state.ttsProvider.activeProvider;
        return state.selectedVoice[targetProvider] ?? '';
      },

      // Gemini 설정 액션
      setGeminiModel: (model: string) => {
        set((state) => ({
          geminiSettings: { ...state.geminiSettings, model },
        }));
      },

      setGeminiTemperature: (temperature: number) => {
        set((state) => ({
          geminiSettings: { ...state.geminiSettings, temperature },
        }));
      },

      setCustomPrompt: (prompt: string) => {
        set((state) => ({
          geminiSettings: { ...state.geminiSettings, customPrompt: prompt },
        }));
      },

      resetGeminiSettings: () => {
        set({ geminiSettings: DEFAULT_GEMINI_SETTINGS });
      },
    }),
    {
      name: 'belief-changer-settings',
      // 기존 데이터와 병합
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<SettingsState>),
        // aiGenerationEnabled가 없는 기존 데이터 처리 (기본값 true)
        aiGenerationEnabled: (persistedState as Partial<SettingsState>)?.aiGenerationEnabled ?? true,
        // generationCount가 없는 기존 데이터 처리 (기본값 3)
        generationCount: (persistedState as Partial<SettingsState>)?.generationCount ?? 3,
        // ttsProvider가 없는 기존 데이터 처리
        ttsProvider: {
          ...DEFAULT_TTS_PROVIDER_SETTINGS,
          ...((persistedState as Partial<SettingsState>)?.ttsProvider ?? {}),
        },
        // selectedVoice가 없는 기존 데이터 처리
        selectedVoice: {
          ...DEFAULT_SELECTED_VOICE,
          ...((persistedState as Partial<SettingsState>)?.selectedVoice ?? {}),
        },
        // geminiSettings가 없는 기존 데이터 처리
        geminiSettings: {
          ...DEFAULT_GEMINI_SETTINGS,
          ...((persistedState as Partial<SettingsState>)?.geminiSettings ?? {}),
        },
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, VoiceSettings, TTSProviderType, TTSProviderSettings } from '../types';

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

interface SettingsState extends Settings {
  // TTS Provider 설정
  ttsProvider: TTSProviderSettings;

  // Actions - 기존
  setUserName: (name: string) => void;
  setGeminiApiKey: (key: string) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  resetVoiceSettings: () => void;
  hasApiKey: () => boolean;

  // Actions - TTS Provider
  setActiveProvider: (provider: TTSProviderType) => void;
  setElevenLabsApiKey: (key: string) => void;
  setOpenAIApiKey: (key: string) => void;
  getActiveApiKey: () => string | undefined;
  hasTTSApiKey: (provider?: TTSProviderType) => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: '',
      geminiApiKey: '',
      voiceSettings: DEFAULT_VOICE_SETTINGS,
      ttsProvider: DEFAULT_TTS_PROVIDER_SETTINGS,

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
    }),
    {
      name: 'belief-changer-settings',
      // 기존 데이터와 병합
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<SettingsState>),
        // ttsProvider가 없는 기존 데이터 처리
        ttsProvider: {
          ...DEFAULT_TTS_PROVIDER_SETTINGS,
          ...((persistedState as Partial<SettingsState>)?.ttsProvider ?? {}),
        },
      }),
    }
  )
);

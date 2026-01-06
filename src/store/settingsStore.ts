import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, VoiceSettings, TTSProviderType, TTSProviderSettings, SpeakerVoiceSettings, GeminiSettings } from '../types';

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

const DEFAULT_SPEAKER_VOICES: SpeakerVoiceSettings = {
  webspeech: {},
  elevenlabs: {},
  openai: {},
};

const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  model: 'gemini-2.0-flash',
  temperature: 1.0,
  customPrompt: '',
};

interface SettingsState extends Settings {
  // TTS Provider 설정
  ttsProvider: TTSProviderSettings;

  // 화자별 음성 설정
  speakerVoices: SpeakerVoiceSettings;

  // Gemini 설정
  geminiSettings: GeminiSettings;

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

  // Actions - 화자별 음성
  setSpeakerVoice: (provider: TTSProviderType, speakerKey: string, voiceId: string) => void;
  getSpeakerVoice: (provider: TTSProviderType, speakerKey: string) => string | undefined;
  getSpeakerVoiceMap: (provider: TTSProviderType) => Map<string, string>;

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
      ttsProvider: DEFAULT_TTS_PROVIDER_SETTINGS,
      speakerVoices: DEFAULT_SPEAKER_VOICES,
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

      // 화자별 음성 액션
      setSpeakerVoice: (provider: TTSProviderType, speakerKey: string, voiceId: string) => {
        set((state) => ({
          speakerVoices: {
            ...state.speakerVoices,
            [provider]: {
              ...state.speakerVoices[provider],
              [speakerKey]: voiceId,
            },
          },
        }));
      },

      getSpeakerVoice: (provider: TTSProviderType, speakerKey: string) => {
        return get().speakerVoices[provider]?.[speakerKey];
      },

      getSpeakerVoiceMap: (provider: TTSProviderType) => {
        const voiceSettings = get().speakerVoices[provider] ?? {};
        return new Map(Object.entries(voiceSettings));
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
        // ttsProvider가 없는 기존 데이터 처리
        ttsProvider: {
          ...DEFAULT_TTS_PROVIDER_SETTINGS,
          ...((persistedState as Partial<SettingsState>)?.ttsProvider ?? {}),
        },
        // speakerVoices가 없는 기존 데이터 처리
        speakerVoices: {
          ...DEFAULT_SPEAKER_VOICES,
          ...((persistedState as Partial<SettingsState>)?.speakerVoices ?? {}),
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

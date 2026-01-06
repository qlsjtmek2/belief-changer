import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, VoiceSettings } from '../types';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
};

interface SettingsState extends Settings {
  // Actions
  setUserName: (name: string) => void;
  setGeminiApiKey: (key: string) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  resetVoiceSettings: () => void;
  hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: '',
      geminiApiKey: '',
      voiceSettings: DEFAULT_VOICE_SETTINGS,

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
    }),
    {
      name: 'belief-changer-settings',
    }
  )
);

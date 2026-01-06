// === Affirmation (확언) ===
export interface Affirmation {
  id: string;
  text: string;
  createdAt: number;
}

// === Dialogue (대화 스크립트) ===
export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface Dialogue {
  id: string;
  affirmationId: string;
  lines: DialogueLine[];
  createdAt: number;
}

// === Settings (설정) ===
export interface VoiceSettings {
  rate: number;      // 0.1 ~ 10 (기본 1)
  pitch: number;     // 0 ~ 2 (기본 1)
  volume: number;    // 0 ~ 1 (기본 1)
}

export interface Settings {
  userName: string;
  geminiApiKey: string;
  voiceSettings: VoiceSettings;
}

// === TTS 관련 ===
export type PlaybackStatus = 'idle' | 'playing' | 'paused';

export type TTSProviderType = 'webspeech' | 'elevenlabs' | 'openai';

export interface TTSProviderSettings {
  activeProvider: TTSProviderType;
  elevenlabsApiKey: string;
  openaiApiKey: string;
}

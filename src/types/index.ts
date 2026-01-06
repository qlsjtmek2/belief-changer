// === Affirmation (확언) ===
export interface Affirmation {
  id: string;
  text: string;
  createdAt: number;
}

// === Dialogue (대화 스크립트) ===
export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
}

// Gemini API에서 반환하는 원본 형식 (id 없음)
export type RawDialogueLine = Omit<DialogueLine, 'id'>;

// === Playlist (플레이리스트) ===
export type PlaylistMode = 'single' | 'all';

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

// 화자별 음성 설정 (Provider별)
export interface SpeakerVoiceSettings {
  webspeech: Record<string, string>;   // speakerKey -> voiceId
  elevenlabs: Record<string, string>;
  openai: Record<string, string>;
}

// === Affirmation (확언) ===
export interface Affirmation {
  id: string;
  text: string;       // 변형된 확언 텍스트
  createdAt: number;
}

// === Settings (설정) ===
export interface VoiceSettings {
  rate: number;      // 0.1 ~ 10 (기본 1)
  pitch: number;     // 0 ~ 2 (기본 1)
  volume: number;    // 0 ~ 1 (기본 1)
}

export interface GeminiSettings {
  model: string;         // 기본값: 'gemini-2.0-flash'
  temperature: number;   // 0.0 ~ 2.0 (기본 1.0)
  customPrompt: string;  // 빈 문자열이면 기본 프롬프트 사용
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

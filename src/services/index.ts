export { generateAffirmations } from './gemini';
export type { GenerateAffirmationsOptions } from './gemini';

// TTS 서비스
export {
  speakText,
  pause,
  resume,
  stop,
  getPlaybackState,
  ttsManager,
  audioSessionKeeper,
  preloadText,
} from './tts';
export type {
  TTSProvider,
  TTSVoice,
  TTSProviderConfig,
  TTSSpeakOptions,
  SpeakTextOptions,
} from './tts';

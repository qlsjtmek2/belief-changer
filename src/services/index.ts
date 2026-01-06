export { generateDialogue } from './gemini';
export type { GenerateDialogueOptions } from './gemini';

// TTS 서비스 (새 Provider 패턴)
export {
  speakDialogue,
  pause,
  resume,
  stop,
  getPlaybackState,
  ttsManager,
} from './tts';
export type {
  TTSProvider,
  TTSVoice,
  TTSProviderConfig,
  TTSSpeakOptions,
  SpeakDialogueOptions,
} from './tts';

export { generateDialogue } from './gemini';
export type { GenerateDialogueOptions } from './gemini';

export {
  getVoices,
  getKoreanVoices,
  speak,
  speakDialogue,
  pause,
  resume,
  stop,
  getPlaybackState,
} from './tts';
export type { Voice, SpeakOptions, SpeakDialogueOptions } from './tts';

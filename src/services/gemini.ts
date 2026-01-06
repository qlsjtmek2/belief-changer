import { GoogleGenAI, Type } from '@google/genai';
import type { DialogueLine, GeminiSettings } from '../types';
import { createDialoguePrompt } from '../utils/prompts';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_TEMPERATURE = 1.0;

const dialogueSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      speaker: {
        type: Type.STRING,
        description: '화자의 이름 또는 역할 (예: 친구, 동료, 멘토)',
      },
      text: {
        type: Type.STRING,
        description: '화자가 말하는 대사',
      },
    },
    propertyOrdering: ['speaker', 'text'],
    required: ['speaker', 'text'],
  },
};

export interface GenerateDialogueOptions {
  affirmation: string;
  userName?: string;
  speakerCount?: number;
  geminiSettings?: GeminiSettings;
}

export async function generateDialogue(
  apiKey: string,
  options: GenerateDialogueOptions
): Promise<DialogueLine[]> {
  const {
    affirmation,
    userName = '사용자',
    speakerCount = 3,
    geminiSettings,
  } = options;

  const model = geminiSettings?.model || DEFAULT_MODEL;
  const temperature = geminiSettings?.temperature ?? DEFAULT_TEMPERATURE;
  const customPrompt = geminiSettings?.customPrompt;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = createDialoguePrompt(affirmation, userName, speakerCount, customPrompt);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: dialogueSchema,
      temperature,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini API 응답이 비어있습니다.');
  }

  const dialogueLines: DialogueLine[] = JSON.parse(text);
  return dialogueLines;
}

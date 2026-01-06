import { GoogleGenAI, Type } from '@google/genai';
import type { GeminiSettings } from '../types';
import { createAffirmationPrompt } from '../utils/prompts';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_TEMPERATURE = 1.0;

const affirmationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
    description: '변형된 확언 문장',
  },
};

export interface GenerateAffirmationsOptions {
  affirmation: string;
  userName?: string;
  count?: number;
  geminiSettings?: GeminiSettings;
}

/**
 * 확언을 변형하여 여러 버전 생성
 * @returns 변형된 확언 문자열 배열
 */
export async function generateAffirmations(
  apiKey: string,
  options: GenerateAffirmationsOptions
): Promise<string[]> {
  const {
    affirmation,
    userName = '사용자',
    count = 3,
    geminiSettings,
  } = options;

  const model = geminiSettings?.model || DEFAULT_MODEL;
  const temperature = geminiSettings?.temperature ?? DEFAULT_TEMPERATURE;
  const customPrompt = geminiSettings?.customPrompt;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = createAffirmationPrompt(affirmation, userName, count, customPrompt);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: affirmationSchema,
      temperature,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini API 응답이 비어있습니다.');
  }

  const affirmations: string[] = JSON.parse(text);
  return affirmations;
}

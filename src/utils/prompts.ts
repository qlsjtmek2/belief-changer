/**
 * 기본 프롬프트 템플릿
 * 사용 가능한 변수: {{affirmation}}, {{userName}}, {{count}}
 */
export const DEFAULT_PROMPT_TEMPLATE = `당신은 긍정 확언 변형 전문가입니다.

## 목표
사용자의 확언을 다양한 표현으로 변형하여 {{count}}개의 새로운 확언을 만드세요.
마치 주변 사람들이 "{{userName}}"에 대해 긍정적으로 이야기하는 것처럼 들려야 합니다.

## 원본 확언
"{{affirmation}}"

## 작성 지침
1. "{{userName}}"을 주어로 사용하세요 (예: "{{userName}}은 정말...", "{{userName}}이는...")
2. 각 변형은 원본의 핵심 메시지를 유지하되 다른 표현/관점으로 작성하세요.
3. 친구, 동료, 가족, 멘토 등 다양한 사람이 말하는 것처럼 자연스러운 톤으로 작성하세요.
4. 각 확언은 1~2문장으로 간결하게 작성하세요.

## 핵심 규칙 (반드시 준수)
- **부정형 표현 절대 금지**: "~하지 않는다", "~이 아니다", "~없다" 등 부정문 사용 금지
  - 예시: "스트레스 받지 않는다" (X) → "마음이 편안하다" (O)
- **과거 대비 표현 금지**: "예전에는 ~였는데 지금은 ~하다" 형식 사용 금지
- **순수 긍정 표현만 사용**: 현재 시점에서 긍정적인 상태를 직접 묘사

## 출력 형식
JSON 문자열 배열로 출력하세요.
예시: ["{{userName}}은 정말 대단한 사람이야", "{{userName}}이의 노력이 빛나고 있어"]`;

/**
 * 프롬프트 템플릿에 변수 적용
 */
export function applyPromptVariables(
  template: string,
  variables: {
    affirmation: string;
    userName: string;
    count: number;
  }
): string {
  const { affirmation, userName, count } = variables;

  return template
    .replace(/\{\{affirmation\}\}/g, affirmation)
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{count\}\}/g, String(count));
}

/**
 * 확언 변형 프롬프트 생성 (커스텀 프롬프트 지원)
 */
export function createAffirmationPrompt(
  affirmation: string,
  userName: string,
  count: number,
  customPrompt?: string
): string {
  const template = customPrompt?.trim() || DEFAULT_PROMPT_TEMPLATE;
  return applyPromptVariables(template, { affirmation, userName, count });
}

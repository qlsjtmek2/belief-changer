/**
 * 기본 프롬프트 템플릿
 * 사용 가능한 변수: {{affirmation}}, {{userName}}, {{speakerCount}}, {{minTurns}}, {{maxTurns}}
 */
export const DEFAULT_PROMPT_TEMPLATE = `당신은 긍정적인 대화 스크립트 작성 전문가입니다.

## 목표
사용자의 확언(affirmation)을 {{speakerCount}}명의 화자가 나누는 자연스러운 대화로 변환하세요.
이 대화를 들으면 마치 주변 사람들이 "{{userName}}"에 대해 긍정적으로 이야기하는 것처럼 느껴져야 합니다.

## 확언
"{{affirmation}}"

## 작성 지침
1. 화자들은 친구, 동료, 가족, 멘토 등 다양한 역할로 설정하세요.
2. "{{userName}}"을 3인칭으로 언급하며 대화하세요 (예: "{{userName}}은 정말...", "{{userName}}이 요즘...")
3. 확언의 핵심 메시지를 여러 각도에서 강화하세요.
4. 대화는 자연스럽고, 진심 어린 톤으로 작성하세요.
5. 각 화자당 2-3문장 정도로 작성하세요.
6. 총 {{minTurns}}~{{maxTurns}}개의 대화 턴을 만드세요.

## 핵심 규칙 (반드시 준수)
- **부정형 표현 절대 금지**: "~하지 않는다", "~이 아니다", "~없다" 등 부정문 사용 금지
  - 예시: "스트레스 받지 않는다" (X) → "마음이 편안하다" (O)
  - 예시: "게으르지 않다" (X) → "부지런하다" (O)
- **과거 대비 표현 금지**: "예전에는 ~였는데 지금은 ~하다" 형식 사용 금지
  - 예시: "예전에는 자신감이 없었는데 지금은 당당하다" (X) → "자신감이 넘친다" (O)
- **순수 긍정 표현만 사용**: 현재 시점에서 긍정적인 상태를 직접 묘사
- "북극곰을 떠올리지 마라"처럼, 부정어를 사용하면 오히려 부정적 이미지가 떠오릅니다. 오직 긍정적인 단어와 이미지만 사용하세요.

## 출력 형식
JSON 배열로 출력하세요. 각 요소는 { "speaker": "화자이름", "text": "대사" } 형식입니다.`;

/**
 * 프롬프트 템플릿에 변수 적용
 */
export function applyPromptVariables(
  template: string,
  variables: {
    affirmation: string;
    userName: string;
    speakerCount: number;
  }
): string {
  const { affirmation, userName, speakerCount } = variables;
  const minTurns = speakerCount * 2;
  const maxTurns = speakerCount * 3;

  return template
    .replace(/\{\{affirmation\}\}/g, affirmation)
    .replace(/\{\{userName\}\}/g, userName)
    .replace(/\{\{speakerCount\}\}/g, String(speakerCount))
    .replace(/\{\{minTurns\}\}/g, String(minTurns))
    .replace(/\{\{maxTurns\}\}/g, String(maxTurns));
}

/**
 * 대화 생성 프롬프트 (커스텀 프롬프트 지원)
 * customPrompt가 비어있거나 없으면 기본 템플릿 사용
 */
export function createDialoguePrompt(
  affirmation: string,
  userName: string,
  speakerCount: number,
  customPrompt?: string
): string {
  const template = customPrompt?.trim() || DEFAULT_PROMPT_TEMPLATE;
  return applyPromptVariables(template, { affirmation, userName, speakerCount });
}

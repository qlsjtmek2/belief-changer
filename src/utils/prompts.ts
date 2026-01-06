export function createDialoguePrompt(
  affirmation: string,
  userName: string,
  speakerCount: number
): string {
  return `당신은 긍정적인 대화 스크립트 작성 전문가입니다.

## 목표
사용자의 확언(affirmation)을 ${speakerCount}명의 화자가 나누는 자연스러운 대화로 변환하세요.
이 대화를 들으면 마치 주변 사람들이 "${userName}"에 대해 긍정적으로 이야기하는 것처럼 느껴져야 합니다.

## 확언
"${affirmation}"

## 작성 지침
1. 화자들은 친구, 동료, 가족, 멘토 등 다양한 역할로 설정하세요.
2. "${userName}"을 3인칭으로 언급하며 대화하세요 (예: "${userName}은 정말...", "${userName}이 요즘...")
3. 확언의 핵심 메시지를 여러 각도에서 강화하세요.
4. 대화는 자연스럽고, 진심 어린 톤으로 작성하세요.
5. 각 화자당 2-3문장 정도로 작성하세요.
6. 총 ${speakerCount * 2}~${speakerCount * 3}개의 대화 턴을 만드세요.

## 출력 형식
JSON 배열로 출력하세요. 각 요소는 { "speaker": "화자이름", "text": "대사" } 형식입니다.`;
}

# Belief Changer - 개발 계획

> 생성일: 2026-01-06
> 총 Phase: 8개
> 총 작업: 25개

## 프로젝트 개요

- **목적**: 확언(affirmation)을 여러 사람의 대화로 변환하여 TTS로 들려주는 웹 앱
- **기술 스택**: React + TypeScript + Vite, Zustand, Gemini API, Web Speech API
- **MVP Features**: 확언 관리, AI 대화 생성, TTS 재생, 설정 관리

---

## Phase 1: 프로젝트 초기화

> **활성화 해야 할 스킬**:
> - `dev-toolkit:ui-ux-design-architect` - 테마 시스템 및 색상 팔레트 설계

- [x] Vite + React + TypeScript 프로젝트 생성
- [x] 폴더 구조 설정 (components, pages, services, store, types, theme)
- [x] 다크 테마 시스템 구축 (colors, typography)
- [x] 기본 컴포넌트 개발 (Button, Input)

## Phase 2: 상태관리 및 타입

> **활성화 해야 할 스킬**: 없음 (기본 TypeScript/Zustand 패턴 사용)

- [x] 타입 정의 (Affirmation, Dialogue, Settings)
- [x] affirmationStore 구현 (확언 CRUD, localStorage persist)
- [x] dialogueStore 구현 (대화 생성/저장/재생 상태)
- [x] settingsStore 구현 (API 키, 음성 설정)

## Phase 3: Gemini API 연동

> **활성화 해야 할 스킬**:
> - `dev-toolkit:systematic-debugging` - API 연동 시 문제 해결

- [x] gemini.ts 서비스 구현 (API 호출, JSON Schema 출력)
- [x] 프롬프트 템플릿 작성 (자연스러운 대화 생성용)

## Phase 4: TTS 서비스

> **활성화 해야 할 스킬**:
> - `dev-toolkit:systematic-debugging` - 브라우저 호환성 이슈 디버깅

- [x] Web Speech API 래퍼 구현 (speak, getVoices)
- [x] 순차 재생 로직 구현 (화자별 다른 목소리)

## Phase 5: UI 컴포넌트

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 고품질 UI 컴포넌트 생성
> - `dev-toolkit:ui-ux-design-architect` - 컴포넌트 UX 설계

- [x] AffirmationCard - 확언 표시/편집/삭제
- [x] DialoguePlayer - 대화 재생 UI (재생/정지, 진행 표시)
- [x] VoiceSelector - 화자별 음성 선택

## Phase 6: 페이지 조립

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 페이지 레이아웃 및 UI

- [x] HomePage - 확언 입력, 대화 생성/재생
- [x] SettingsPage - API 키 입력, 음성 설정, 사용자 이름

## Phase 7: 마무리

> **활성화 해야 할 스킬**:
> - `dev-toolkit:code-refactoring` - 코드 정리 및 개선

- [x] 로딩/에러 상태 UI 개선
- [x] CLAUDE.md 프로젝트 문서 작성

## Phase 8: TTS 서비스 확장

> **활성화 해야 할 스킬**:
> - `dev-toolkit:systematic-debugging` - API 연동 시 문제 해결

고품질 TTS 서비스 추가 (ElevenLabs, OpenAI TTS)

- [x] TTS Provider 인터페이스 설계 및 추상화
- [x] 기존 Web Speech API를 WebSpeechProvider로 래핑
- [x] ElevenLabs Provider 구현
- [x] OpenAI TTS Provider 구현
- [x] settingsStore 확장 (TTS 제공자 선택, API 키)
- [x] SettingsPage TTS 설정 UI 추가

## Phase 9: 개선

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 고품질 UI 컴포넌트 생성
> - `dev-toolkit:ui-ux-design-architect` - 컴포넌트 UX 설계

- [x] 대화 추가로 더 생성하기, 대화 삭제 및 순서 변경 기능, 각 확언마다 TTS를 따로따로 재생하는게 아니라 통합 플레이리스트에서 확언을 재생하는 기능이어야 함. 그리고 생성된 데이터는 새로고침해도 유지되어야 함.
- [x] 재미나이 프롬프트, 모델, 온도를 설정에서 바꿀 수 있도록.
확언 자체를 지우면 전체 플레이리스트에서도 그 확언이 지워지도록.

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 고품질 UI 컴포넌트 생성
> - `dev-toolkit:ui-ux-design-architect` - 컴포넌트 UX 설계

- [x] 전체 플레이리스트에서 재생 후 중지 버튼 활성화가 안됨, 개별 재생 전체 재생이 레이아웃이 차이가 있는데 통일하자
- [x] 커스텀 프롬프트 입력창에서 백그라운드로 깔지 말고, 이미 입력이 되어있고 그걸 수정할 수 있도록 만들기. 그리고 수정하다가 다시 되돌릴 수 있어야 하니깐 기본 프롬프트 복구하기 버튼을 아래에다 만들어두기.
- [x] 프롬프트는 다음을 고려하여 수정되어야 한다. 대화문은 북극곰을 떠올리지 마라를 참고하여 ~~였는데 지금은 ~~하다 이런거 뽑지 말고 그냥 긍정적인 부분만 뽑아주고, 부정문은 뽑지 않도록. 예를들어 나는 부정적이지 않다 -> 나는 긍정적이다 이런 느낌
- [x] 개별 재생, 전체 재생 구분을 없애자. 그리고 입력창에 확언과 생성할 대화문
 개수를 지정하고, 추가하면 바로 AI로 대화문 5개를 대화 플레이리스트에 
추가해. 그리고 플레이 리스트에는 그냥 대화문을 재생하고, 순서를 바꾸고, 
삭제하고, 재생하고, 삭제하는 기능만 있으면 돼. 
- [x] 만약 처음 들어와서 등록된 확언이 없다면, UI를 마치 검색 사이트처럼(좌우 여백) 가운데에 확언 입력하는 크큰 입력 필드 하나와 우측 위에 설정 아이콘만 있는거야. 그리고 입력하면 그 아래에 자연스럽게 확언 대화 플레이리스트가 생기는거야. 재생 버튼은 플레이리스트 맨 위에, 입력 창 아래에 있어서 입력 -> 재생 계층을 만들고, 입력 후 자연스럽게 플레이에 시선이 갈 수 있도록 만들어야 해.
- [x] 자 내생각에 지금 3개 대화를 추가하면, 확언에 관한 대화 
세트가 3개 추가되는거같은데, 맞아? 그렇다면 그게 아니라, 그냥
 이렇게 하자. 대화가 아니라 확언을 추가하는게 맞는데, 좀 
다양한 바리에이션으로 확언을 추가하는거야. 예를들어 '나는 
소중하다' 이렇게 넣으면 'ㅇㅇ이는 정말 소중한 사람이야' 
이런식의 확언을 3개 추가하는거야. 그리고 입력한 것을 
보여주는게 아니라 그 추가한 확언을 플레이리스트에서 보여줘야 
해. 그러면 이제 9개 라인 6개 라인 이런게 없어도 되겠지? 
그리고 1, 2, 3, 순서도 굳이 매길 필요는 없을 것 같아
- [x] 그리고 입력 필드와 생성하기 버튼을 구분하지 말고, 마치 검색창 처럼 '생성하기' 라는 글씨 말고 간단하게 + 아이콘을 텍스트 필드 안에다가 집어넣자. 그건 누를 수 있도록 인지되어야 해.
- [x] 그리고 설정 아이콘이 설정 아이콘 같지 않음.
- [x] 그리고 플레이리스트에서 문장 더블클릭하면 문장 수정할 수 있게 만들어야 함. 그리고 설정창을 누르면 트랜지션이 자연스럽게 적용되는데 메인화면은 안되어있어서 설정창 -> 메인화면 이동시 부자연스럽게 느껴짐.
- [x] 그리고 지금 문제점이 초기 화면에서 대화 생성했을 때 넘어가는 페이지가 뚝 끊겨서 부자연스러워 보여. 그래서 트랜지션을 어떻게 만들고 싶나면, 가장 초기 화면은 검색창같은 화면이지? 거기에서 대화 선택하기를 누르면, 제목과 부제목이 자연스럽게 애니메이션으로 사라지고, 그 아래에 플레이리스트가 애니메이션으로 자연스럽게 등장하면서 포커스가 자동으로 플레이리스트에 맞춰지도록 만들고싶어. 그 적절한 애니메이션은 너가 고민해서 잘 넣어줘. 그리고 확언을 다 지웠을 때 초기화면으로 돌아가는 애니메이션도 다시 자연스럽게 플레이리스트가 사라지면서 글씨와 보조글씨도 자연스럽게 다시 등장하고, 입력 필드도 중앙으로 자연스럽게 포커스되는 애니메이션을 넣어야 함. 즉 반대도 자연스러운 트랜지션이 되어야 한다 이거지 --ultrathink
- [x] 플레이어 바 문장이 중앙 정렬되었으면 좋겠어. 그리고 재생되는 효과는 아이콘 대신 문장 글씨 자체에 효과를 넣었으면 좋겠어.
- [x] 설정창으로 넘어가도 TTS가 끊기지 않고 계속 재생되도록.
- [x] 모바일 화면에서도 이쁘게 보이게 하고싶어. 지금 좀 답답한 부분이 뭐나면 모바일 화면에선 (가로가 좁은 세로 화면) Play Bar가 너무 세로폭이 얇아 그리고 여기선 1/6 이거 없앤거 좋은데 그러면 텍스트가 오른쪽으로 더 넓은 공간을 차지해도 좋을 거 같아. 그리고 플레이리스트 패널의 글씨가 두줄로 겹쳐지게 보이는데 그러면 위아래 여백이 너무 타이트해져서 답답해져. 이를 개선하자.
- [x] AI 생성 여부 토글 추가
- [x] 추가시 토스트 메세지지

---

## 진행 상황

| Phase | 상태 | 완료 |
|-------|------|------|
| Phase 1: 프로젝트 초기화 | ✅ 완료 | 4/4 |
| Phase 2: 상태관리 및 타입 | ✅ 완료 | 4/4 |
| Phase 3: Gemini API 연동 | ✅ 완료 | 2/2 |
| Phase 4: TTS 서비스 | ✅ 완료 | 2/2 |
| Phase 5: UI 컴포넌트 | ✅ 완료 | 3/3 |
| Phase 6: 페이지 조립 | ✅ 완료 | 2/2 |
| Phase 7: 마무리 | ✅ 완료 | 2/2 |
| Phase 8: TTS 서비스 확장 | ✅ 완료 | 6/6 |

**전체 진행률**: 25/25 (100%) 🎉

---

## 데이터 모델

```typescript
// 확언
interface Affirmation {
  id: string;
  content: string;      // "나는 1억 이상을 가지고 있다"
  createdAt: Date;
}

// 대화 라인
interface DialogueLine {
  speakerId: string;    // "A", "B", "C"
  speakerName: string;  // "철수", "영희"
  text: string;
}

// 설정
interface Settings {
  userName: string;
  geminiApiKey: string;
  speakerCount: number;
  voices: VoiceConfig[];
}
```

---

## 핵심 플로우

```
입력: "나는 1억 이상을 가지고 있다"
       ↓
[Gemini API] 대화 생성
       ↓
출력: A: "희곤이가 1억 이상을 가지고 있대"
      B: "정말? 부럽다"
       ↓
[Web Speech API] 순차 재생 (화자별 다른 목소리)
```

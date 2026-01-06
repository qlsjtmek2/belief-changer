# Belief Changer - 개발 계획

> 생성일: 2026-01-06
> 총 Phase: 7개
> 총 작업: 19개

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

- [ ] Web Speech API 래퍼 구현 (speak, getVoices)
- [ ] 순차 재생 로직 구현 (화자별 다른 목소리)

## Phase 5: UI 컴포넌트

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 고품질 UI 컴포넌트 생성
> - `dev-toolkit:ui-ux-design-architect` - 컴포넌트 UX 설계

- [ ] AffirmationCard - 확언 표시/편집/삭제
- [ ] DialoguePlayer - 대화 재생 UI (재생/정지, 진행 표시)
- [ ] VoiceSelector - 화자별 음성 선택

## Phase 6: 페이지 조립

> **활성화 해야 할 스킬**:
> - `dev-toolkit:frontend-design` - 페이지 레이아웃 및 UI

- [ ] HomePage - 확언 입력, 대화 생성/재생
- [ ] SettingsPage - API 키 입력, 음성 설정, 사용자 이름

## Phase 7: 마무리

> **활성화 해야 할 스킬**:
> - `dev-toolkit:code-refactoring` - 코드 정리 및 개선

- [ ] 로딩/에러 상태 UI 개선
- [ ] CLAUDE.md 프로젝트 문서 작성

---

## 진행 상황

| Phase | 상태 | 완료 |
|-------|------|------|
| Phase 1: 프로젝트 초기화 | 대기 | 0/4 |
| Phase 2: 상태관리 및 타입 | 대기 | 0/4 |
| Phase 3: Gemini API 연동 | 대기 | 0/2 |
| Phase 4: TTS 서비스 | 대기 | 0/2 |
| Phase 5: UI 컴포넌트 | 대기 | 0/3 |
| Phase 6: 페이지 조립 | 대기 | 0/2 |
| Phase 7: 마무리 | 대기 | 0/2 |

**전체 진행률**: 0/19 (0%)

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

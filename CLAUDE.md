# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Belief Changer (믿음 변화기)** - 사용자가 입력한 확언(affirmation)을 여러 사람의 대화로 변환하여 TTS로 들려주는 웹 앱.

### 핵심 플로우

```
확언 입력 → Gemini AI 대화 생성 → Web Speech API TTS 재생
```

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **상태관리**: Zustand (persist 미들웨어로 localStorage 저장)
- **AI**: Gemini API (대화 스크립트 생성)
- **TTS**: Web Speech API (브라우저 내장)
- **스타일**: 커스텀 CSS (다크 테마)

## 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

## 디렉토리 구조

```
src/
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── Button.tsx           # 버튼 (primary/secondary/ghost, isLoading 지원)
│   ├── Input.tsx            # 입력 필드 (label, hint 지원)
│   ├── AffirmationCard.tsx  # 확언 카드 (선택/편집/삭제)
│   ├── DialoguePlayer.tsx   # 대화 재생기 (진행바, 컨트롤)
│   └── VoiceSelector.tsx    # 음성 선택 (미사용)
├── pages/           # 페이지 컴포넌트
│   ├── HomePage.tsx         # 메인 화면 (확언 목록 + 대화 재생)
│   └── SettingsPage.tsx     # 설정 화면 (API 키, 음성 설정)
├── services/        # 외부 API 연동
│   ├── gemini.ts            # Gemini API 호출
│   └── tts.ts               # Web Speech API 래퍼
├── store/           # Zustand 스토어
│   ├── affirmationStore.ts  # 확언 CRUD
│   ├── dialogueStore.ts     # 대화 및 재생 상태
│   └── settingsStore.ts     # 사용자 설정
├── types/           # TypeScript 타입 정의
│   └── index.ts             # Affirmation, Dialogue, Settings 등
├── utils/           # 유틸리티 함수
│   └── prompts.ts           # Gemini 프롬프트 생성
└── theme/           # 테마 시스템
    ├── colors.ts            # 색상 팔레트
    ├── typography.ts        # 폰트 설정
    └── spacing.ts           # 간격 시스템
```

## 주요 타입

```typescript
// 확언
interface Affirmation {
  id: string;
  text: string;
  createdAt: number;
}

// 대화 라인
interface DialogueLine {
  speaker: string;
  text: string;
}

// 음성 설정
interface VoiceSettings {
  rate: number;    // 0.1~10 (기본 1)
  pitch: number;   // 0~2 (기본 1)
  volume: number;  // 0~1 (기본 1)
}

// 재생 상태
type PlaybackStatus = 'idle' | 'playing' | 'paused';
```

## 상태 관리 (Zustand)

### affirmationStore

확언 CRUD 및 선택 상태 관리. localStorage 영속성.

- `addAffirmation(text)`: 확언 추가
- `deleteAffirmation(id)`: 확언 삭제
- `selectAffirmation(id)`: 확언 선택

### dialogueStore

대화 생성/저장 및 재생 상태 관리.

- `addDialogue(affirmationId, lines)`: 대화 저장
- `setPlaybackStatus(status)`: 재생 상태 변경
- `resetPlayback()`: 재생 초기화

### settingsStore

API 키 및 음성 설정 관리.

- `setGeminiApiKey(key)`: API 키 설정
- `updateVoiceSettings(settings)`: 음성 설정 변경

## 서비스 레이어

### services/gemini.ts

Gemini API를 사용해 확언을 대화로 변환.

```typescript
generateDialogue(apiKey, { affirmation, userName, speakerCount })
```

### services/tts.ts

Web Speech API를 래핑하여 대화 순차 재생.

```typescript
speakDialogue(lines, { settings, onLineStart, onComplete, onError })
pause()
resume()
stop()
```

## 주의사항

### Web Speech API

- Chrome에서는 `speechSynthesis.onvoiceschanged` 이벤트로 음성 목록 비동기 로딩
- 한국어 음성 지원 여부 런타임 체크 필요

### API 키

- Gemini API 키는 설정 페이지에서 사용자가 직접 입력
- localStorage에 저장 (클라이언트 노출됨, 개인용 앱)

### 스타일링

- 색상과 타이포그래피는 `src/theme/`의 중앙화된 값 사용
- 컴포넌트에 색상 하드코딩 금지
- CSS 변수: `--color-*`, `--spacing-*`, `--radius-*` 사용

### UI 패턴

- 에러: `home-page__error` 클래스 (아이콘 + 메시지 + 닫기 버튼)
- 로딩: 스켈레톤 UI (`home-page__skeleton`) 또는 Button의 `isLoading` prop
- Empty State: `home-page__empty` 클래스 (dashed border 스타일)

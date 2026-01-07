# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Belief Changer (믿음 변화기)** - 사용자가 입력한 확언(affirmation)을 여러 사람의 대화로 변환하여 TTS로 들려주는 웹 앱.

### 핵심 플로우

```
확언 입력 → N개 대화 병렬 생성 → 플레이리스트로 연속 재생
```

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **상태관리**: Zustand (persist 미들웨어로 localStorage 저장)
- **AI**: Gemini API (대화 스크립트 생성)
- **TTS**: Provider 패턴 (Web Speech API, ElevenLabs, OpenAI TTS)
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
│   └── PlaylistPanel.tsx    # 플레이리스트 (재생 컨트롤, 드래그 순서 변경, 삭제)
├── pages/           # 페이지 컴포넌트
│   ├── HomePage.tsx         # 메인 화면 (확언 입력 + 플레이리스트)
│   └── SettingsPage.tsx     # 설정 화면 (API 키, TTS 설정, 음성 설정)
├── services/        # 외부 API 연동
│   ├── gemini.ts            # Gemini API 호출
│   └── tts/                 # TTS Provider 패턴
│       ├── index.ts         # 공개 API (speakDialogue, pause, resume, stop)
│       ├── types.ts         # TTSProvider 인터페이스
│       ├── TTSManager.ts    # Provider 싱글톤 관리
│       ├── cache.ts         # LRU 세션 캐시
│       ├── speakDialogue.ts # 대화 순차 재생 로직
│       └── providers/       # TTS 구현체
│           ├── WebSpeechProvider.ts   # 브라우저 내장 (무료)
│           ├── ElevenLabsProvider.ts  # 고품질 AI 음성
│           └── OpenAITTSProvider.ts   # OpenAI TTS
├── store/           # Zustand 스토어
│   ├── dialogueStore.ts     # 대화 및 재생 상태
│   ├── settingsStore.ts     # 사용자 설정 + TTS Provider 설정
│   └── toastStore.ts        # 전역 토스트 상태 관리
├── types/           # TypeScript 타입 정의
│   └── index.ts             # Dialogue, Settings, TTSProviderType 등
├── utils/           # 유틸리티 함수
│   └── prompts.ts           # Gemini 프롬프트 생성
└── theme/           # 테마 시스템
    ├── colors.ts            # 색상 팔레트
    ├── typography.ts        # 폰트 설정
    └── spacing.ts           # 간격 시스템
```

## 주요 타입

```typescript
// 대화 라인
interface DialogueLine {
  id: string;        // 라인 고유 ID (삭제/순서 변경용)
  speaker: string;
  text: string;
}

// 대화 스크립트
interface Dialogue {
  id: string;
  sourceAffirmation: string;  // 생성에 사용된 확언 텍스트
  lines: DialogueLine[];
  createdAt: number;
}

// 음성 설정
interface VoiceSettings {
  rate: number;    // 0.1~10 (기본 1)
  pitch: number;   // 0~2 (기본 1)
  volume: number;  // 0~1 (기본 1)
}

// 재생 상태
type PlaybackStatus = 'idle' | 'playing' | 'paused';

// TTS Provider 타입
type TTSProviderType = 'webspeech' | 'elevenlabs' | 'openai';

// OpenAI TTS 모델
type OpenAITTSModel = 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts';

// TTS Provider 설정
interface TTSProviderSettings {
  activeProvider: TTSProviderType;
  elevenlabsApiKey: string;
  openaiApiKey: string;
  openaiModel: OpenAITTSModel;  // 기본값: 'gpt-4o-mini-tts'
}

// 화자별 음성 설정 (Provider별)
interface SpeakerVoiceSettings {
  webspeech: Record<string, string>;   // speakerKey ("0", "1", "2") -> voiceId
  elevenlabs: Record<string, string>;
  openai: Record<string, string>;
}

// Gemini 설정
interface GeminiSettings {
  model: string;         // 기본값: 'gemini-2.0-flash'
  temperature: number;   // 0.0~2.0 (기본 1.0)
  customPrompt: string;  // 빈 문자열이면 기본 프롬프트 사용
}

// Gemini API 원본 응답 (id 없음)
type RawDialogueLine = Omit<DialogueLine, 'id'>;
```

## 상태 관리 (Zustand)

### dialogueStore

대화 생성/저장, 재생 상태, 플레이리스트 관리. localStorage 영속성.

**상태**:
- `dialogues`: 대화 목록
- `currentDialogueIndex`: 현재 재생 중인 대화 인덱스
- `currentLineIndex`: 현재 재생 중인 라인 인덱스
- `playbackStatus`: 재생 상태 ('idle' | 'playing' | 'paused')

**액션**:
- `addDialogue(sourceAffirmation, lines)`: 대화 1개 저장
- `addDialogues(sourceAffirmation, dialoguesData[])`: 대화 N개 일괄 저장
- `deleteDialogue(id)`: 대화 삭제
- `clearAllDialogues()`: 전체 삭제
- `reorderDialogues(dialogueIds)`: 플레이리스트 순서 변경
- `getCurrentDialogue()`: 현재 재생 중인 대화 반환
- `deleteLine(dialogueId, lineId)`: 대화 내 특정 라인 삭제
- `reorderLines(dialogueId, lineIds)`: 대화 내 라인 순서 변경
- `setCurrentDialogue(index)`: 대화 선택
- `advanceToNextDialogue()`: 다음 대화로 이동 (연속 재생용)
- `setPlaybackStatus(status)`: 재생 상태 변경
- `setCurrentLineIndex(index)`: 현재 라인 인덱스 변경
- `resetPlayback()`: 재생 초기화

### settingsStore

API 키, TTS Provider, 음성 설정, 화자별 음성, Gemini 설정 관리.

- `setGeminiApiKey(key)`: Gemini API 키 설정
- `updateVoiceSettings(settings)`: 음성 설정 변경
- `setActiveProvider(provider)`: TTS Provider 변경
- `setElevenLabsApiKey(key)`: ElevenLabs API 키 설정
- `setOpenAIApiKey(key)`: OpenAI API 키 설정
- `hasTTSApiKey()`: 현재 Provider의 API 키 설정 여부 확인
- `setSpeakerVoice(provider, speakerKey, voiceId)`: 화자별 음성 설정
- `getSpeakerVoice(provider, speakerKey)`: 화자별 음성 ID 조회
- `getSpeakerVoiceMap(provider)`: Provider별 화자-음성 Map 반환
- `setGeminiModel(model)`: Gemini 모델 변경
- `setGeminiTemperature(temp)`: 창의성 온도 변경 (0.0~2.0)
- `setCustomPrompt(prompt)`: 커스텀 프롬프트 설정
- `resetGeminiSettings()`: Gemini 설정 초기화

## 서비스 레이어

### services/gemini.ts

Gemini API를 사용해 확언을 대화로 변환.

```typescript
generateDialogue(apiKey, { affirmation, userName, speakerCount, geminiSettings })
```

**지원 모델**: `gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`

### utils/prompts.ts

프롬프트 템플릿과 커스텀 프롬프트 지원.

```typescript
// 기본 템플릿
DEFAULT_PROMPT_TEMPLATE

// 템플릿 변수: {{affirmation}}, {{userName}}, {{speakerCount}}, {{minTurns}}, {{maxTurns}}
createDialoguePrompt(affirmation, userName, speakerCount, customPrompt?)
```

### services/tts/ (TTS Provider 패턴)

Provider 패턴으로 다양한 TTS 엔진을 지원합니다.

```typescript
// 공개 API (기존 호환)
speakDialogue(lines, { settings, speakerVoiceMap, onLineStart, onComplete, onError })
pause()
resume()
stop()

// TTSManager로 Provider 전환
ttsManager.setProvider('elevenlabs', { apiKey, voiceSettings })
ttsManager.getProvider()

// Provider 메서드
provider.getAvailableVoices()  // 전체 음성 목록
provider.getKoreanVoices()     // 한국어 음성 목록 (필터링된)
```

**지원 Provider**:
- `webspeech`: 브라우저 내장 (무료, 오프라인)
- `elevenlabs`: 고품질 AI 음성 (API 키 필요)
- `openai`: OpenAI TTS (API 키 필요)

**세션 캐싱**: ElevenLabs/OpenAI 오디오를 메모리에 캐싱 (LRU, 50개 항목)

## UI 구조

### 빈 상태 (검색 사이트 스타일)
- 화면 중앙에 큰 입력 필드
- 대화 개수 선택 버튼 (1, 2, 3, 5, 10)
- 우측 상단 설정 아이콘

### 플레이리스트 모드
- 상단: 입력 폼 (확언 + 개수 + 생성 버튼)
- 재생 컨트롤 (▶ ⏸ ⏹)
- 플레이리스트 (현재 재생 강조, 드래그 순서 변경, 삭제)

## 주의사항

### Web Speech API

- Chrome에서는 `speechSynthesis.onvoiceschanged` 이벤트로 음성 목록 비동기 로딩
- 한국어 음성 지원 여부 런타임 체크 필요

### API 키

- 모든 API 키는 설정 페이지에서 사용자가 직접 입력
- localStorage에 저장 (클라이언트 노출됨, 개인용 앱)
- **Gemini**: 대화 생성용
- **ElevenLabs**: 고품질 TTS (선택)
- **OpenAI**: TTS 또는 향후 GPT 연동 (선택)

### 스타일링

- 색상과 타이포그래피는 `src/theme/`의 중앙화된 값 사용
- 컴포넌트에 색상 하드코딩 금지
- CSS 변수: `--color-*`, `--spacing-*`, `--radius-*` 사용

### UI 패턴

- 에러: `home-page__error` 클래스 (아이콘 + 메시지 + 닫기 버튼)
- 로딩: Button의 `isLoading` prop 또는 진행률 바
- Empty State: 검색 사이트 스타일 중앙 정렬
- 토스트: 전역 `toast` 함수 사용 (스택형, 최신이 아래에 표시)

### 토스트 시스템

전역 토스트 시스템으로 여러 메시지를 스택 형태로 표시합니다.

```typescript
import { toast } from '../store';

// 성공 메시지 (기본 2.5초)
toast.success('확언이 추가되었습니다');

// 오류 메시지 (기본 4초)
toast.error('API 키가 설정되지 않았습니다.');

// 커스텀 duration
toast.success('저장됨', 1500);
```

- `ToastContainer`가 App.tsx에 전역으로 마운트됨
- 최신 토스트가 아래에, 이전 토스트는 위로 스택됨
- 클릭하면 즉시 닫힘
- 자동 퇴장 애니메이션 적용

### TTS 재생 딜레이

- 각 확언 재생 후 **1.5초** 딜레이 적용
- 사용자가 숨 쉴 틈을 제공하여 자연스러운 청취 경험

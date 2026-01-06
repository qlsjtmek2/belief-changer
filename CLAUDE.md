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
├── pages/           # 페이지 컴포넌트 (HomePage, SettingsPage)
├── services/        # 외부 API 연동 (gemini.ts, tts.ts)
├── store/           # Zustand 스토어 (affirmation, dialogue, settings)
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸리티 함수 (prompts.ts)
└── theme/           # 테마 시스템 (colors, typography)
```

## 아키텍처

### 데이터 모델
- **Affirmation**: 사용자가 입력한 확언 문장
- **Dialogue**: Gemini가 생성한 여러 화자의 대화 스크립트
- **Settings**: 사용자 이름, API 키, 음성 설정

### 상태 관리 (Zustand)
- `affirmationStore`: 확언 CRUD, localStorage 영속성
- `dialogueStore`: 대화 생성/저장/재생 상태
- `settingsStore`: API 키 및 음성 설정 (사용자가 설정 페이지에서 입력)

### 서비스 레이어
- `services/gemini.ts`: Gemini API 호출, JSON Schema 기반 구조화 출력
- `services/tts.ts`: Web Speech API 래퍼, 화자별 다른 목소리로 순차 재생

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

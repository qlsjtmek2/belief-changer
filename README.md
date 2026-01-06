# Belief Changer (믿음 변화기)

사용자가 입력한 확언(affirmation)을 여러 사람의 대화로 변환하여 TTS로 들려주는 웹 앱입니다.

## 핵심 기능

- 확언 입력 및 관리
- Gemini AI를 활용한 대화 스크립트 생성
- Web Speech API를 통한 TTS 재생

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19 + TypeScript + Vite |
| 상태관리 | Zustand |
| AI | Gemini API |
| TTS | Web Speech API |
| 스타일 | 커스텀 CSS (다크 테마) |

## 시작하기

### 요구사항

- Node.js 20+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버: http://localhost:5173

### 스크립트

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint 실행
npm run type-check # TypeScript 타입 검사
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/          # 페이지 컴포넌트
├── services/       # 외부 API 연동 (Gemini, TTS)
├── store/          # Zustand 상태 관리
├── types/          # TypeScript 타입 정의
└── theme/          # 테마 시스템 (colors, typography, spacing)
```

## CI/CD

GitHub Actions를 통해 자동화된 파이프라인이 구성되어 있습니다.

### CI (Pull Request / Push to main)
- ESLint 검사
- TypeScript 타입 검사
- 빌드 테스트

### CD (Push to main)
- GitHub Pages 자동 배포

## 라이선스

MIT

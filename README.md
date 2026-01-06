# Belief Changer

사용자가 입력한 확언(affirmation)을 여러 사람의 대화로 변환하여 TTS로 들려주는 웹 앱입니다.

## 이론적 배경: 자유 에너지 원리 (FEP)

나와 외부 세계는 마르코프 블랭킷(Markov Blanket)으로 구분됩니다. 우리는 외부를 직접 볼 수 없고, 블랭킷을 통해 전해지는 감각 정보로만 외부를 추론합니다. 즉, 우리는 외부 감각 정보를 설명하는 **생성 모델(Generative Model)**을 가지고 있습니다.

모델의 정밀도(precision)에 따라 두 가지 선택이 가능합니다:
1. **모델 수정**: 들어오는 감각에 맞게 믿음을 업데이트
2. **행동**: 감각 정보 자체를 바꾸기 위해 환경에 개입

이 과정은 **자유 에너지를 최소화**하고, **놀라움(surprise)을 줄이는** 과정과 동등합니다.

### 믿음의 층위

- **유전적 믿음**: 진화를 거쳐 축적된, 변경 불가능한 핵심 믿음 (예: "나는 물고기가 아니다")
- **후천적 믿음**: 살아가며 형성되는 가치관, 문화, 자아 이미지

### 믿음 변화의 메커니즘

특정 믿음의 정밀도를 낮추고, 새로운 믿음의 정밀도를 높이려면?

예: "나는 소심하다" → "나는 밝고 명랑하다"

**방법:**
1. 기존 믿음과 반하는 예측 오류가 생길 때의 **불안감을 감쇠**
2. 새로운 믿음으로 **재학습**
   - 반복 확언 (Affirmation)
   - 정밀한 시뮬레이션 (Visualization)
   - 실제로 그렇게 연기 (Acting As If)

### 이 앱의 원리

"남에게 그렇게 듣는 것"이 실제로 믿음 변화에 효과가 있다면, **TTS로 여러 사람이 나에 대해 긍정적으로 이야기하는 것을 반복해서 듣는 것**이 믿음 재학습에 도움이 될 수 있습니다.

---

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

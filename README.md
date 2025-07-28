# 🎯 Clarity Coach - 목표 기반 학습 전략 생성 앱

AI 기반 목표 분석 및 주차별 맞춤형 학습 전략을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🤖 AI Agent 시스템
- **Planner Agent (목표 분석가)**: 사용자의 목표를 깊이 분석하여 핵심 요소 추출
- **Strategy Agent (전략 설계 코치)**: 분석 결과를 바탕으로 주차별 실행 전략 설계

### 📋 기능 상세
1. **목표 분석**: 입력된 목표의 난이도, 필요 기간, 핵심 키워드 분석
2. **맞춤형 전략**: 개인별 시간과 역량에 맞는 주차별 학습 계획
3. **실행 가능한 과제**: 구체적이고 현실적인 일일/주간 과제 제공
4. **피드백 시스템**: 각 과제별 연습 방법과 피드백 방식 제안

## 🚀 사용 방법

### 1단계: 목표 입력
- 메인 페이지에서 학습하고 싶은 목표를 구체적으로 입력
- 예: "미술사에 대해 영어로 말할 수 있게 되기"

### 2단계: 목표 분석 (Planner Agent)
- AI가 목표를 다각도로 분석
- 적정 학습 기간, 난이도, 핵심 키워드 도출
- 주당 적절한 과제 수 제안

### 3단계: 전략 설계 (Strategy Agent)
- 분석 결과를 바탕으로 주차별 상세 전략 생성
- 각 주차별 테마와 구체적인 실행 과제 제공
- 연습 방법, 피드백, 기록 방식 포함

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (바닐라)
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT API
- **스타일링**: Pretendard 폰트, 반응형 디자인

## 📁 프로젝트 구조

```
clarity-coach/
├── index.html              # 메인 페이지 (목표 입력)
├── planner-agent.html      # Planner Agent (목표 분석)
├── strategy-agent.html     # Strategy Agent (전략 설계)
├── process.html            # 기존 학습 프로세스 (호환성)
├── script.js               # 메인 스크립트
├── server.js               # Express 서버
├── style.css               # 스타일시트
├── package.json            # 의존성 관리
└── README.md               # 프로젝트 설명
```

## 🔧 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd clarity-coach
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 OpenAI API 키를 설정:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 서버 실행
```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 모드
npm start
```

### 5. 브라우저에서 접속
```
http://localhost:3000
```

## 🎯 AI Agent 상세 설명

### Planner Agent (목표 분석가)
**역할**: 사용자의 목표를 체계적으로 분석하여 학습 계획의 기초 데이터 생성

**분석 요소**:
- 목표의 구체성과 명확성
- 실현 가능한 학습 기간 추정
- 핵심 키워드 및 학습 영역 파악
- 적정 난이도 및 주당 과제 수 제안

**출력 형태**:
```json
{
  "main_goal": "정제된 목표",
  "duration_weeks": 4,
  "keywords": ["키워드1", "키워드2"],
  "tasks_per_week": 2,
  "difficulty_level": "중급"
}
```

### Strategy Agent (전략 설계 코치)
**역할**: Planner Agent의 분석 결과를 바탕으로 실행 가능한 주차별 전략 설계

**설계 원칙**:
- 단계적 난이도 상승
- 현실적이고 실행 가능한 과제
- 매주 피드백과 개선 가능한 구조
- 구체적인 연습 방법 제시

**출력 형태**:
```json
{
  "week1": {
    "theme": "기초 다지기",
    "tasks": ["구체적 과제1", "구체적 과제2"]
  },
  "week2": {
    "theme": "심화 학습",
    "tasks": ["발전된 과제1", "발전된 과제2"]
  }
}
```

## 📱 사용자 경험 흐름

1. **목표 입력** → 명확하고 구체적인 학습 목표 작성
2. **목표 분석** → AI가 목표를 다각도로 분석하여 학습 계획의 기초 설정
3. **전략 설계** → 분석 결과를 바탕으로 주차별 맞춤형 실행 계획 생성
4. **실행 및 피드백** → 제공된 전략에 따라 학습 진행 및 주기적 점검

## 🔄 데이터 흐름

1. **사용자 입력** → localStorage에 목표 저장
2. **Planner Agent** → 목표 분석 후 `analysis_data` 저장
3. **Strategy Agent** → 분석 데이터 활용하여 주차별 전략 생성
4. **결과 제공** → 실행 가능한 학습 계획과 다음 단계 안내

## 🎨 UI/UX 특징

- **직관적 인터페이스**: 단계별 명확한 진행 과정
- **반응형 디자인**: 모바일과 데스크톱 모두 최적화
- **로딩 애니메이션**: AI 처리 중 사용자 경험 개선
- **색상 코딩**: 각 단계별 시각적 구분
- **한국어 최적화**: 자연스러운 한국어 인터페이스

## 🔮 향후 개발 계획

- [ ] 일정 관리 연동 (Google Calendar)
- [ ] 진도 추적 및 성취도 시각화
- [ ] 커뮤니티 기능 (학습 파트너 매칭)
- [ ] 모바일 앱 버전
- [ ] 다양한 학습 스타일별 전략 템플릿

## 📄 라이선스

ISC License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

> 💡 **팁**: 더 정확한 전략을 원한다면 목표를 구체적으로 작성해보세요. 예를 들어 "영어 공부"보다는 "비즈니스 영어 회화 실력 향상"이 더 좋은 결과를 제공합니다. 
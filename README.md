# 🎯 Clarity Coach

목표 달성을 위한 당신의 개인 AI 코치입니다.

## ✨ 주요 기능

### 📚 목표 기반 학습 전략
- 장기적인 목표를 입력하면 체계적인 학습 계획을 생성
- AI 기반 맞춤형 전략 제안
- 단계별 실행 가이드 제공

### 📅 하루 계획 코치  
- 오늘 해야 할 일들을 입력하면 효율적인 하루 일정 생성
- 우선순위 자동 정리 및 시간 배분
- 집중/휴식/식사 시간을 고려한 현실적인 계획
- 타임라인 형태의 직관적인 일정표
- 친근한 코치 메시지와 함께 동기 부여

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드  
npm start
```

### 3. 브라우저에서 접속

```
http://localhost:3000
```

## 💡 사용법

### 하루 계획 코치 사용법

1. **할 일 입력**: 오늘 해야 할 일들을 자유롭게 입력
   - 예: "UX 과제 완성, 영어 공부, 운동하기, 장보기"

2. **시간 설정**: 하루 시작 시간과 종료 시간 설정

3. **제약사항 추가** (선택사항): 
   - 예: "3시에 병원 가야함, 집중력이 아침에 좋음"

4. **일정 생성**: AI가 분석해서 최적의 하루 일정을 제안

5. **일정 저장**: 생성된 계획을 로컬에 저장 가능

### 코치의 특징

- **현실적 계획**: 집중 시간을 최대 2시간으로 제한
- **균형 잡힌 일정**: 작업, 휴식, 식사 시간을 모두 고려  
- **우선순위 기반**: 중요한 일부터 배치
- **친근한 소통**: 친구 같은 말투로 격려와 조언 제공

## 🛠 기술 스택

- **Frontend**: HTML, CSS, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT API
- **스타일링**: Custom CSS with Pretendard 폰트

## 📁 프로젝트 구조

```
clarity-coach/
├── index.html              # 메인 페이지 (기능 선택)
├── daily-planner.html      # 하루 계획 코치 페이지
├── daily-planner.js        # 계획 코치 로직
├── planner-style.css       # 계획 코치 스타일
├── script.js               # 메인 로직
├── style.css               # 기본 스타일
├── server.js               # Express 서버
├── package.json            # 의존성 관리
└── README.md              # 프로젝트 문서
```

## 🎯 사용 예시

### 하루 계획 코치 예시

**입력:**
```
할 일: UX 디자인 과제, 영어 공부, 헬스장, 장보기
시간: 09:00 ~ 22:00
제약사항: 점심은 12시에, 저녁 6시 이후에는 가벼운 일만
```

**결과:**
```
✨ 좋아! 오늘은 꽤 바쁘네. 이렇게 짜보는 건 어때?

📊 오늘의 통계
- 할 일: 4개
- 작업 시간: 6시간  
- 휴식 시간: 2시간

⏰ 타임라인
09:00 - 09:30  🎯 하루 준비 및 계획 점검
09:30 - 11:30  💼 UX 디자인 과제 (집중 시간)
11:30 - 12:00  ☕ 휴식 및 점심 준비
12:00 - 13:00  🍽️ 점심 시간
13:00 - 14:30  📚 영어 공부
...
```

## 🔧 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## 📝 라이선스

ISC License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**💡 팁**: Ctrl+Enter로 빠르게 계획을 생성할 수 있어요! 
# Clarity Coach - 목표 기반 학습 전략 생성 앱

사용자가 목표를 입력하면 GPT를 통해 개인화된 학습 전략을 생성하는 웹 애플리케이션입니다.

## 설치 및 실행

### 방법 1: 로컬 개발 환경

#### 1. 의존성 설치
```bash
npm install
```

#### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

#### 3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

#### 4. 브라우저에서 접속
```
http://localhost:3000
```

### 방법 2: Docker 배포

#### 1. 환경 변수 설정
```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

#### 2. 배포 스크립트 실행
```bash
./deploy.sh
```

#### 3. 수동 Docker 배포
```bash
# Docker 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d
```

### 방법 3: 클라우드 배포

#### Heroku 배포
```bash
# Heroku CLI 설치 후
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_openai_api_key_here
git push heroku main
```

#### Vercel 배포
```bash
# Vercel CLI 설치 후
vercel --env OPENAI_API_KEY=your_openai_api_key_here
```

## 주요 기능

- **목표 입력**: 사용자가 학습 목표를 입력
- **전략 생성**: GPT API를 통해 개인화된 3가지 학습 전략 생성
- **MCP 형식 일일 스케줄 생성**: Strategy Agent의 MCP 형식 전략을 받아서 시간별 스케줄 생성
- **지정된 시간 형식 지원**: 파싱 가능한 표준 시간 형식 제공
- **안전한 API 호출**: 백엔드 프록시를 통한 API 키 보호

## 파일 구조

```
├── index.html              # 목표 입력 페이지
├── process.html            # 전략 결과 페이지 (Strategy Agent)
├── scheduler.html          # MCP 형식 일일 스케줄 생성 페이지 (Scheduler Agent)
├── strategy-agent.js       # Strategy Agent 로직
├── scheduler-agent.js      # MCP 형식 Scheduler Agent 로직
├── mcp-scheduler-style.css # MCP 형식 스케줄 전용 스타일
├── test-mcp-scheduler.js   # MCP Scheduler Agent 테스트 스크립트
├── style.css               # 공통 스타일시트
├── script.js               # 목표 입력 페이지 스크립트
├── server.js               # Express 백엔드 서버
├── package.json            # 프로젝트 설정
├── Dockerfile              # Docker 배포 설정
├── docker-compose.yml      # Docker Compose 설정
├── deploy.sh               # 배포 스크립트
├── .env.example            # 환경 변수 예시
└── .env                   # 환경 변수 (API 키 등)
```

## 보안

- OpenAI API 키는 서버의 `.env` 파일에서 관리
- 프론트엔드에서는 API 키가 노출되지 않음
- 백엔드 프록시를 통한 안전한 API 호출

## 🎯 Scheduler Agent (MCP 형식 일일 스케줄 코치)

Strategy Agent가 MCP(Model Context Protocol) 형식으로 전달한 주간 실행 전략을 받아서, 사용자가 매일 실천할 수 있는 세부 시간별 스케줄로 변환하는 역할을 합니다.

### 주요 기능
- **MCP 형식 데이터 처리**: Strategy Agent의 MCP 형식 전략을 받아서 처리
- **주간 전략 → 일일 시간별 스케줄 변환**: 주간 목표를 하루 단위 시간별 활동으로 분해
- **지정된 시간 형식 지원**: 
  - 형식 1: `[HH:MM] 활동명 (N분)`
  - 형식 2: `오전/오후 HH시MM분~HH시MM분: 활동명`
- **시간대별 활동 배치**: 사용자의 가용 시간에 맞춰 활동을 시간대별로 배치
- **휴식 시간 포함**: 적절한 휴식 시간을 포함한 현실적인 스케줄 생성
- **친근한 메시지**: 사용자가 쉽게 따라할 수 있도록 친근한 언어 사용
- **HTML 렌더링**: 시각적으로 보기 좋은 HTML 형태로 스케줄 출력
- **텍스트 형식 출력**: 클립보드 복사 가능한 텍스트 형식 제공

### MCP 형식 데이터 구조
```json
{
  "goal": "사용자의 최종 목표",
  "duration": "전체 학습 기간 (ex: 4주)",
  "weekly_plan": {
    "week": 1,
    "objectives": ["주간 목표 1", "주간 목표 2"],
    "steps": {
      "Mon": "월요일 활동",
      "Tue": "화요일 활동",
      "Wed": "수요일 활동",
      "Thu": "목요일 활동",
      "Fri": "금요일 활동",
      "Sat": "토요일 활동",
      "Sun": "일요일 활동"
    }
  }
}
```

### 사용 방법
1. `/scheduler` 페이지 접속
2. 시간 설정 (시작/종료 시간, 하루 학습 시간)
3. MCP 데이터 입력 또는 예시 데이터 사용
4. "친근한 스케줄 생성하기" 버튼 클릭
5. 생성된 시간별 스케줄 확인
6. 텍스트 형식으로 복사하여 활용

### 테스트 방법
```bash
# MCP Scheduler Agent 테스트
node test-mcp-scheduler.js
```

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **API**: OpenAI GPT-3.5-turbo
- **스타일**: Pretendard 폰트, Apple 스타일 디자인
- **프로토콜**: MCP (Model Context Protocol) 형식 지원 
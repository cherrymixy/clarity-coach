# Clarity Coach - 목표 기반 학습 전략 생성 앱

사용자가 목표를 입력하면 GPT를 통해 개인화된 학습 전략을 생성하는 웹 애플리케이션입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

## 주요 기능

- **목표 입력**: 사용자가 학습 목표를 입력
- **전략 설계 코치**: 주차별 상세한 학습 전략 생성
- **학습 프로세스**: 3가지 학습 스타일별 전략 제안
- **안전한 API 호출**: 백엔드 프록시를 통한 API 키 보호

## 파일 구조

```
├── index.html          # 메인 목표 입력 페이지
├── strategy.html       # 전략 설계 코치 페이지
├── process.html        # 학습 프로세스 페이지
├── strategy-agent.js   # 전략 설계 코치 에이전트
├── style.css           # 스타일시트
├── script.js           # 목표 입력 페이지 스크립트
├── server.js           # Express 백엔드 서버
├── package.json        # 프로젝트 설정
└── .env               # 환경 변수 (API 키 등)
```

## 보안

- OpenAI API 키는 서버의 `.env` 파일에서 관리
- 프론트엔드에서는 API 키가 노출되지 않음
- 백엔드 프록시를 통한 안전한 API 호출

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **API**: OpenAI GPT-3.5-turbo
- **스타일**: Pretendard 폰트, Apple 스타일 디자인

## 배포 방법

### Docker를 사용한 배포

1. **Docker 이미지 빌드**
```bash
docker build -t clarity-coach .
```

2. **환경 변수 설정**
```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

3. **Docker Compose로 실행**
```bash
docker-compose up -d
```

### 클라우드 배포

#### Heroku
```bash
# Heroku CLI 설치 후
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_openai_api_key_here
git push heroku main
```

#### Railway
```bash
# Railway CLI 설치 후
railway login
railway init
railway variables set OPENAI_API_KEY=your_openai_api_key_here
railway up
```

#### Vercel
```bash
# Vercel CLI 설치 후
vercel
# 환경 변수는 Vercel 대시보드에서 설정
``` 
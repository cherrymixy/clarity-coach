# 🚀 Clarity Coach 배포 가이드

## 📋 개요

Clarity Coach는 Strategy Agent와 Scheduler Agent가 연동된 학습 전략 생성 애플리케이션입니다.

### 🔄 에이전트 간 전달 흐름

1. **Strategy Agent** → 사용자 목표를 받아서 GPT API로 개인화된 주간 전략 생성
2. **Scheduler Agent** → Strategy Agent의 전략을 받아서 상세한 일일 일정표 생성
3. **사용자** → 실천 가능한 구체적인 일정표 확인

## 🛠 배포 방법

### 방법 1: 로컬 개발 환경

#### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn
- OpenAI API 키

#### 설치 단계
```bash
# 1. 저장소 클론
git clone <repository-url>
cd clarity-coach

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 OPENAI_API_KEY 설정

# 4. 서버 실행
npm start

# 5. 브라우저에서 접속
# http://localhost:3000
```

### 방법 2: Docker 배포

#### 필수 요구사항
- Docker
- Docker Compose
- OpenAI API 키

#### 자동 배포
```bash
# 1. 환경 변수 설정
export OPENAI_API_KEY=your_openai_api_key_here

# 2. 배포 스크립트 실행
./deploy.sh
```

#### 수동 배포
```bash
# 1. 환경 변수 설정
export OPENAI_API_KEY=your_openai_api_key_here

# 2. Docker 이미지 빌드
docker-compose build

# 3. 컨테이너 실행
docker-compose up -d

# 4. 상태 확인
docker-compose ps
docker-compose logs
```

### 방법 3: 클라우드 배포

#### Heroku 배포
```bash
# 1. Heroku CLI 설치 및 로그인
heroku login

# 2. 앱 생성
heroku create your-app-name

# 3. 환경 변수 설정
heroku config:set OPENAI_API_KEY=your_openai_api_key_here

# 4. 배포
git push heroku main

# 5. 앱 열기
heroku open
```

#### Vercel 배포
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 배포
vercel --env OPENAI_API_KEY=your_openai_api_key_here

# 4. 프로덕션 배포
vercel --prod
```

#### AWS 배포
```bash
# 1. AWS CLI 설정
aws configure

# 2. ECR에 이미지 푸시
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag clarity-coach:latest your-account.dkr.ecr.us-east-1.amazonaws.com/clarity-coach:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/clarity-coach:latest

# 3. ECS 서비스 배포
aws ecs update-service --cluster your-cluster --service clarity-coach --force-new-deployment
```

## 🔧 환경 변수

| 변수명 | 설명 | 필수 | 기본값 |
|--------|------|------|--------|
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ | - |
| `PORT` | 서버 포트 | ❌ | 3000 |
| `NODE_ENV` | 환경 설정 | ❌ | development |

## 📁 파일 구조

```
clarity-coach/
├── 📄 index.html              # 목표 입력 페이지
├── 📄 process.html            # Strategy Agent 페이지
├── 📄 scheduler.html          # Scheduler Agent 페이지
├── 📄 strategy-agent.js       # Strategy Agent 로직
├── 📄 scheduler-agent.js      # Scheduler Agent 로직
├── 📄 scheduler-style.css     # 일정표 스타일
├── 📄 style.css               # 공통 스타일
├── 📄 script.js               # 목표 입력 스크립트
├── 📄 server.js               # Express 서버
├── 📄 package.json            # 프로젝트 설정
├── 🐳 Dockerfile              # Docker 설정
├── 🐳 docker-compose.yml      # Docker Compose 설정
├── 📜 deploy.sh               # 배포 스크립트
├── 📜 .env.example            # 환경 변수 예시
└── 📜 .env                    # 환경 변수 (로컬)
```

## 🔍 문제 해결

### 일반적인 문제들

#### 1. OpenAI API 키 오류
```bash
# .env 파일 확인
cat .env

# 환경 변수 확인
echo $OPENAI_API_KEY
```

#### 2. 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000

# 다른 포트 사용
PORT=3001 npm start
```

#### 3. Docker 컨테이너 문제
```bash
# 컨테이너 로그 확인
docker-compose logs

# 컨테이너 재시작
docker-compose restart

# 컨테이너 재빌드
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 4. 메모리 부족
```bash
# Node.js 메모리 제한 설정
NODE_OPTIONS="--max-old-space-size=512" npm start
```

## 📊 모니터링

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs clarity-coach
```

### 헬스 체크
```bash
# 서버 상태 확인
curl -f http://localhost:3000

# API 엔드포인트 확인
curl -X POST http://localhost:3000/api/gpt \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

## 🔒 보안 고려사항

1. **API 키 보호**: OpenAI API 키는 항상 환경 변수로 관리
2. **HTTPS 사용**: 프로덕션 환경에서는 HTTPS 필수
3. **CORS 설정**: 필요한 도메인만 허용
4. **요청 제한**: API 호출 횟수 제한 고려

## 📈 성능 최적화

1. **캐싱**: Redis를 사용한 전략 캐싱
2. **로드 밸런싱**: 여러 인스턴스로 트래픽 분산
3. **CDN**: 정적 파일 CDN 사용
4. **데이터베이스**: 사용자 데이터 저장 시 PostgreSQL 사용

## 🆘 지원

문제가 발생하면 다음을 확인해주세요:

1. 로그 파일 확인
2. 환경 변수 설정 확인
3. 네트워크 연결 확인
4. API 키 유효성 확인

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
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
# 개발 모드 (nodemon 사용) - MCP 통합 서버
npm run dev

# 프로덕션 모드 - MCP 통합 서버
npm start

# MCP 서버만 별도 실행 (선택사항)
npm run mcp-server
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

## 주요 기능

- **목표 입력**: 사용자가 학습 목표를 입력
- **전략 생성**: GPT API를 통해 개인화된 3가지 학습 전략 생성
- **창의적 루틴 설계자**: MCP 기반 창의적이고 재미있는 루틴 생성
- **주간 챌린지 생성**: 사용자 관심사에 맞는 추가 챌린지 생성
- **동기부여 부스터**: 현재 상황에 맞는 맞춤형 격려 시스템
- **MCP 리소스 조회**: 창의적 템플릿, 챌린지 데이터베이스 등 조회
- **안전한 API 호출**: 백엔드 프록시를 통한 API 키 보호
- **폴백 시스템**: MCP 실패 시 기존 방식으로 자동 전환

## 파일 구조

```
├── index.html          # 메인 페이지 (기능 선택)
├── process.html        # 체계적 학습 전략 결과 페이지
├── creative-routine.html # 창의적 루틴 설계자 페이지
├── style.css           # 스타일시트
├── script.js           # 목표 입력 페이지 스크립트
├── server.js           # Express 백엔드 서버 (MCP 통합)
├── mcp-server.js       # MCP 서버 (창의적 루틴 설계자)
├── mcp-client.js       # MCP 클라이언트
├── package.json        # 프로젝트 설정
└── .env               # 환경 변수 (API 키 등)
```

## MCP 아키텍처

### 🔧 MCP 서버 (mcp-server.js)
- **도구 (Tools)**: 
  - `design_creative_routine`: 창의적 루틴 설계
  - `generate_weekly_challenge`: 주간 챌린지 생성
  - `create_motivation_booster`: 동기부여 부스터 생성
  
- **리소스 (Resources)**:
  - `routine://templates/creative`: 창의적 루틴 템플릿
  - `routine://challenges/weekly`: 주간 챌린지 데이터베이스
  - `routine://motivation/boosters`: 동기부여 부스터 컬렉션
  
- **프롬프트 (Prompts)**:
  - `creative_routine_designer`: 창의적 루틴 설계를 위한 시스템 프롬프트

### 🔌 MCP 클라이언트 (mcp-client.js)
- 웹 애플리케이션과 MCP 서버 간 통신
- 자동 재연결 및 에러 처리
- 편의 메서드 제공

## 보안

- OpenAI API 키는 서버의 `.env` 파일에서 관리
- 프론트엔드에서는 API 키가 노출되지 않음
- 백엔드 프록시를 통한 안전한 API 호출

## 창의적 루틴 설계자 기능

### 🎯 특별한 점
- **MCP 기반 구조**: Model Context Protocol을 활용한 확장 가능한 AI 아키텍처
- **개인화된 접근**: 사용자의 관심사와 취향을 반영한 루틴 설계
- **재미 요소**: 랜덤 미션, 주간 챌린지 등을 통한 동기부여
- **시간 맞춤**: 사용자가 실제로 실행 가능한 시간에 맞춤 설계
- **창의적 접근**: 전통적인 학습 방법을 벗어난 새로운 아이디어 제공
- **실시간 확장**: MCP 도구를 통한 동적 기능 확장

### 📋 입력 항목
- **목표**: 달성하고 싶은 구체적인 목표
- **관심사**: 음악, 미술, 운동, 게임 등 다양한 관심사 선택
- **시간**: 하루 15분부터 2시간 이상까지 다양한 시간대 선택

### 📤 출력 결과
- **주차별 전략 테마**: 4주간의 체계적인 진행 계획
- **루틴 유형별 예시**: 3가지 다른 스타일의 루틴 제안
- **재미있는 챌린지**: 동기부여를 위한 특별한 미션들
- **동기부여 부스터**: 현재 상황에 맞는 맞춤형 격려 시스템
- **MCP 기반 추가 기능**: 주간 챌린지 생성, 동기부여 부스터, 리소스 조회 등

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **MCP**: Model Context Protocol (@modelcontextprotocol/sdk)
- **API**: OpenAI GPT-3.5-turbo
- **통신**: WebSocket (MCP), HTTP REST API
- **스타일**: Pretendard 폰트, Apple 스타일 디자인 
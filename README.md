# Clarity Coach - MCP 기반 압축 루틴 전략가

사용자가 목표를 입력하면 MCP(Model Context Protocol)를 통해 최단 시간 내 핵심만 익히는 압축 루틴을 생성하는 웹 애플리케이션입니다.

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
- **MCP 기반 전략 생성**: Model Context Protocol을 통한 표준화된 AI 모델 연동
- **압축 루틴 전략가**: 최단 시간 내 핵심만 익히는 맞춤 루틴 제안
- **확장 가능한 아키텍처**: MCP 표준을 통한 다양한 AI 모델 지원

## 파일 구조

```
├── index.html              # 목표 입력 페이지
├── process.html            # 전략 결과 페이지
├── compressed-routine.html # 압축 루틴 전략가 페이지
├── style.css               # 스타일시트
├── script.js               # 목표 입력 페이지 스크립트
├── server.js               # Express 백엔드 서버 (MCP 클라이언트 포함)
├── mcp-server.js           # MCP 서버 (압축 루틴 생성 툴)
├── mcp-client.js           # MCP 클라이언트
├── mcp-config.json         # MCP 설정 파일
├── package.json            # 프로젝트 설정
└── .env                   # 환경 변수 (API 키 등)
```

## 보안

- OpenAI API 키는 서버의 `.env` 파일에서 관리
- 프론트엔드에서는 API 키가 노출되지 않음
- 백엔드 프록시를 통한 안전한 API 호출

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express
- **MCP**: Model Context Protocol SDK
- **AI 모델**: OpenAI GPT-3.5-turbo (MCP를 통해 연동)
- **스타일**: Pretendard 폰트, Apple 스타일 디자인

## MCP 아키텍처

```
웹 인터페이스 → Express 서버 → MCP 클라이언트 → MCP 서버 → OpenAI API
```

### MCP 서버 기능
- **generate_compressed_routine**: 압축 루틴 생성 툴
- 표준화된 MCP 프로토콜 사용
- 다양한 AI 모델로 쉽게 교체 가능 
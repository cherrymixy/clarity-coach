#!/bin/bash

# Clarity Coach 배포 스크립트

echo "🚀 Clarity Coach 배포 시작..."

# 환경 변수 확인
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다."
    echo "   .env 파일을 생성하고 OPENAI_API_KEY를 설정해주세요."
    exit 1
fi

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 환경 변수 파일 생성
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cat > .env << EOF
OPENAI_API_KEY=$OPENAI_API_KEY
PORT=3000
NODE_ENV=production
EOF
fi

# Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."
docker-compose build

# 컨테이너 실행
echo "🚀 컨테이너 실행 중..."
docker-compose up -d

# 헬스 체크
echo "🏥 헬스 체크 중..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 배포 완료! 애플리케이션이 http://localhost:3000 에서 실행 중입니다."
else
    echo "❌ 배포 실패. 로그를 확인해주세요:"
    docker-compose logs
    exit 1
fi

echo "🎉 Clarity Coach가 성공적으로 배포되었습니다!"
echo "📱 브라우저에서 http://localhost:3000 으로 접속하세요."
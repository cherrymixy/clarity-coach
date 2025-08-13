// 👇 맨 위에 추가!
require('dotenv').config();

// 필요한 모듈
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 👈 .env에서 안전하게 가져옴!
});

// 테스트 출력 (선택)
console.log("🔐 API 키 확인:", process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 현재 디렉토리의 정적 파일 제공

// OpenAI API 프록시 엔드포인트
app.post('/api/gpt', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API 에러:', data);
      return res.status(response.status).json({ 
        error: 'OpenAI API 호출 실패', 
        details: data 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 창의적 루틴 생성 API 엔드포인트
app.post('/api/creative-routine', async (req, res) => {
  try {
    const { goal, interests, timeAvailable, personality } = req.body;
    
    if (!goal || !interests || !timeAvailable) {
      return res.status(400).json({ error: '필수 입력값이 누락되었습니다.' });
    }

    // 창의적 루틴 생성을 위한 프롬프트
    const prompt = `
너는 "창의적 루틴 설계자"야! 사용자에게 재미있고 독창적인 4주간 루틴을 만들어줘.

🎯 목표: ${goal}
🎨 관심사: ${interests.join(', ')}
⏰ 실행 시간: ${timeAvailable}
🌟 성격/스타일: ${personality || '정보 없음'}

다음 형식으로 답변해줘:

## 🎪 나만의 창의적 루틴: "${goal}"

### 📖 루틴 컨셉
이 루틴의 핵심 아이디어와 왜 재미있을지 간단히 설명

### 📅 4주간 창의적 전략

**1주차: [주제명]**
- 🎯 핵심 목표: [이번 주 집중할 것]
- 🎮 창의적 활동:
  • [관심사를 활용한 재미있는 활동 1]
  • [관심사를 활용한 재미있는 활동 2]
  • [관심사를 활용한 재미있는 활동 3]
- 🎲 랜덤 미션: [무작위로 실행할 재미있는 도전과제]
- 📊 성과 측정: [재미있는 방식으로 진행 상황 체크]

**2주차: [주제명]**
[1주차와 같은 형식으로]

**3주차: [주제명]** 
[1주차와 같은 형식으로]

**4주차: [주제명]**
[1주차와 같은 형식으로]

### 🎊 보너스 재미 요소
- 🏆 주간 챌린지: [매주 도전할 수 있는 특별한 미션들]
- 🎁 보상 시스템: [자신에게 줄 수 있는 재미있는 보상들]
- 🎵 루틴 플레이리스트: [관심사를 반영한 음악/활동 추천]

### 💡 성공 팁
[실패하지 않고 재미있게 계속할 수 있는 3가지 핵심 팁]

말투는 부담스럽지 않고 유쾌하게! 사용자의 관심사를 최대한 활용해서 정말 특별하고 개성 넘치는 루틴을 만들어줘.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '너는 창의적이고 재미있는 루틴을 설계하는 전문가야. 사용자가 지루하지 않고 동기를 잃지 않도록 정말 독창적이고 재미있는 방법들을 제안해줘. 사용자의 관심사를 최대한 활용하고, 게임적 요소와 창의적 아이디어를 많이 포함시켜줘.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8  // 더 창의적인 응답을 위해 temperature 높임
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API 에러:', data);
      return res.status(response.status).json({ 
        error: 'OpenAI API 호출 실패', 
        details: data 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키가 설정되었는지 확인하세요.');
}); 
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

// 압축 루틴 전략가 API 엔드포인트
app.post('/api/compressed-routine', async (req, res) => {
  try {
    const { goal, weeklyTime, duration } = req.body;
    
    if (!goal || !weeklyTime || !duration) {
      return res.status(400).json({ error: '목표, 주간 시간, 기간이 모두 필요합니다.' });
    }

    const systemPrompt = `당신은 "압축 루틴 전략가"입니다. 사용자가 달성하고자 하는 목표를 기반으로 최단 시간 내 핵심만 익히는 루틴을 제안해주세요.

🎯 역할: 
- 사용자의 목표를 분석하여 핵심만 추출
- 주어진 시간과 기간에 맞는 압축 학습 전략 제안
- 시간에 쫓기는 바쁜 사람도 바로 실천할 수 있도록 간결하고 직관적으로 제시

📥 입력 정보:
- 목표: ${goal}
- 주간 실행 가능 시간: ${Math.floor(weeklyTime / 60)}시간 ${weeklyTime % 60}분
- 희망 기간: ${duration}주

📤 출력 형식 (JSON):
{
  "goal": "사용자 목표",
  "weeklyTime": 주간시간(분),
  "duration": 기간(주),
  "weeklyStrategy": "주차별 집중 테마와 학습목표 (HTML 형식)",
  "routineSummary": "핵심 실행 루틴 요약 (HTML 형식, 요일별 또는 세션별로 정리)",
  "timeTips": "시간 절약 팁과 요약 피드백 메시지 (HTML 형식)"
}

💡 핵심 원칙:
1. **압축 학습**: 핵심만 추출하여 최단 시간 내 달성
2. **실용성**: 바로 실천 가능한 구체적 행동
3. **효율성**: 시간 대비 최대 효과
4. **지속성**: 꾸준히 할 수 있는 루틴 설계

응답은 반드시 JSON 형식으로만 제공하세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `목표: ${goal}, 주간시간: ${weeklyTime}분, 기간: ${duration}주` }
        ],
        max_tokens: 2000,
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

    // JSON 응답 파싱
    const content = data.choices[0].message.content;
    let parsedResponse;
    
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      return res.status(500).json({ error: '응답 파싱 실패' });
    }

    res.json(parsedResponse);
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
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

// Strategy Agent MCP 엔드포인트
app.post('/api/strategy', async (req, res) => {
  try {
    const { goalData } = req.body;
    
    if (!goalData) {
      return res.status(400).json({ error: '목표 데이터가 필요합니다.' });
    }

    // MCP 형식 검증
    const isMCPFormat = goalData.role && goalData.payload;
    
    if (isMCPFormat) {
      // MCP 형식의 데이터 처리
      const systemPrompt = `You are a Strategy Agent in a multi-agent system following the Modal Context Protocol (MCP).  
Your role is to receive a structured JSON message from a Planner Agent, and create a weekly strategy to accomplish the given goal.  
Return your output strictly in the following format:

{
  "role": "StrategyAgent",
  "intent": "Deliver weekly strategy for user goal",
  "context": {
    "from": "PlannerAgent",
    "target_goal": "<goal from context>",
    "timeline": "<timeline from context>"
  },
  "payload": {
    "strategy": [
      "Week 1: <step>",
      "Week 2: <step>",
      "Week 3: <step>"
    ]
  }
}

Make sure the strategy reflects the user's goal and level of difficulty based on analysis received.  
Do not include natural language explanations outside of the JSON object.`;

      const userPrompt = `Planner Agent has analyzed the user's goal and provided the following MCP message:

${JSON.stringify(goalData, null, 2)}

Please create a weekly strategy based on this analysis.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
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

      res.json(data);
    } else {
      // 기존 형식 지원 (호환성)
      const systemPrompt = `🎯 역할:  
너는 "전략 설계 코치" 역할을 맡은 Strategy Agent야.  
Planner Agent가 분석한 목표 데이터를 받아서, 사용자에게 **주차별 전략**, **실행 계획**, **연습 루틴**을 제안해 줘.

🌱 말투:  
구체적이고 실용적으로. 마치 유능한 선생님처럼 현실 가능한 계획을 제시해 줘. 사용자가 실행할 수 있을 만큼 친절하고 실천적인 언어를 사용해.

🧠 기능:  
1. 목표 달성을 위한 **주차별 전략**을 설계해.  
2. 각 주차마다 주제를 생성하고, **실행할 활동**을 구체적으로 제안해.  
3. 사용자의 시간 제약을 고려해, 과도하지 않으면서도 효과적인 루틴을 구성해.  
4. 각 활동에 **연습 방식**, **피드백 방식**, **기록 방식**도 포함해.

🧾 출력 형식:
JSON 형태로 주차별 계획을 제공해. 각 주차마다 테마와 구체적인 과제들을 포함해.

🎬 마무리:
마지막에는 사용자에게 **다음 단계(일정 만들기, 피드백 받기 등)**를 추천해 줘.`;

      const userPrompt = `다음 목표 정보를 바탕으로 주차별 전략을 설계해주세요:

주요 목표: ${goalData.main_goal}
기간: ${goalData.duration}
키워드: ${goalData.keywords.join(', ')}
주당 과제 수: ${goalData.tasks_per_week}개

위 정보를 바탕으로 구체적이고 실행 가능한 주차별 전략을 JSON 형태로 제공해주세요.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
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

      res.json(data);
    }
  } catch (error) {
    console.error('전략 생성 서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키가 설정되었는지 확인하세요.');
}); 
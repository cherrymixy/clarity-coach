// 👇 맨 위에 추가!
require('dotenv').config();

// 필요한 모듈
const { OpenAI } = require("openai");
const CreativeRoutineClient = require('./mcp-client');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 👈 .env에서 안전하게 가져옴!
});

// MCP 클라이언트 인스턴스 생성
const mcpClient = new CreativeRoutineClient();

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

// 애플리케이션 시작 시 MCP 연결 초기화
async function initializeMCP() {
  try {
    await mcpClient.connect();
    console.log('🎨 MCP 클라이언트 초기화 완료');
    
    // 사용 가능한 도구 목록 출력
    const tools = await mcpClient.listTools();
    console.log('📋 사용 가능한 MCP 도구:', tools.map(t => t.name).join(', '));
    
    // 사용 가능한 리소스 목록 출력
    const resources = await mcpClient.listResources();
    console.log('📚 사용 가능한 MCP 리소스:', resources.map(r => r.name).join(', '));
    
  } catch (error) {
    console.error('❌ MCP 초기화 실패:', error);
    console.log('⚠️  일반 모드로 계속 실행합니다.');
  }
}

// OpenAI API 프록시 엔드포인트 (기존 기능 유지)
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

// MCP 기반 창의적 루틴 설계자 API 엔드포인트
app.post('/api/creative-routine', async (req, res) => {
  try {
    const { goal, interests, timeAvailable, preferences } = req.body;
    
    if (!goal || !interests || !timeAvailable) {
      return res.status(400).json({ error: '목표, 관심사, 가능한 시간이 모두 필요합니다.' });
    }

    console.log('🎨 MCP를 통한 창의적 루틴 설계 요청:', { goal, interests, timeAvailable });

    // MCP 클라이언트를 통해 루틴 설계
    const interestsArray = interests.split(',').map(i => i.trim());
    const result = await mcpClient.designCreativeRoutine(
      goal,
      interestsArray,
      timeAvailable,
      preferences || {}
    );

    // 결과 반환
    res.json({
      success: true,
      content: result[0].text,
      source: 'mcp'
    });
    
  } catch (error) {
    console.error('❌ MCP 루틴 설계 에러:', error);
    
    // MCP 실패 시 폴백으로 기존 방식 사용
    console.log('⚠️  기존 방식으로 폴백 실행');
    
    try {
      const { goal, interests, timeAvailable } = req.body;
      
      const prompt = `
      🎯 역할: 너는 "창의적 루틴 설계자" 역할을 맡은 Strategy Agent야.
      목표를 달성하는 과정에서 사용자가 재미와 동기를 잃지 않도록 창의적이고 다채로운 방식으로 루틴을 제안해 줘.

      🎤 말투: 부담 없고 유쾌하게. 사용자에게 새로운 자극과 도전 의식을 줄 수 있도록 가볍지만 효과적인 루틴을 설계해 줘.

      📥 입력 정보:
      - 목표: ${goal}
      - 관심사/취향: ${interests}
      - 실행 가능 시간: ${timeAvailable}

      📤 출력 요청:
      1. 주차별 전략 주제 (4주차까지)
      2. 루틴 유형별 예시 (3가지 다른 스타일)
      3. 재미 요소 (랜덤 미션, 주간 챌린지 포함)

      응답은 다음 JSON 형식으로 해줘:
      {
        "weeklyThemes": [
          {
            "week": 1,
            "theme": "주차 제목",
            "description": "설명",
            "funElement": "재미 요소"
          }
        ],
        "routineTypes": [
          {
            "type": "루틴 타입명",
            "description": "설명",
            "dailyStructure": "일일 구조 설명",
            "examples": ["예시1", "예시2"]
          }
        ],
        "challenges": [
          {
            "name": "챌린지명",
            "description": "설명",
            "duration": "기간"
          }
        ]
      }
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
              content: '너는 창의적이고 유쾌한 루틴 설계자야. 사용자가 목표를 달성하면서도 재미를 느낄 수 있도록 창의적인 방법을 제안해야 해.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.8
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API 에러:', data);
        return res.status(response.status).json({ 
          error: 'API 호출 실패', 
          details: data 
        });
      }

      res.json({
        success: true,
        content: data.choices[0].message.content,
        source: 'fallback'
      });
      
    } catch (fallbackError) {
      console.error('폴백 에러:', fallbackError);
      res.status(500).json({ error: '루틴 설계 중 오류가 발생했습니다.' });
    }
  }
});

// MCP 도구 목록 API
app.get('/api/mcp/tools', async (req, res) => {
  try {
    const tools = await mcpClient.listTools();
    res.json({ tools });
  } catch (error) {
    console.error('도구 목록 조회 에러:', error);
    res.status(500).json({ error: '도구 목록 조회 실패' });
  }
});

// MCP 리소스 목록 API
app.get('/api/mcp/resources', async (req, res) => {
  try {
    const resources = await mcpClient.listResources();
    res.json({ resources });
  } catch (error) {
    console.error('리소스 목록 조회 에러:', error);
    res.status(500).json({ error: '리소스 목록 조회 실패' });
  }
});

// MCP 리소스 읽기 API
app.get('/api/mcp/resources/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const uri = `routine://${type}`;
    
    const contents = await mcpClient.readResource(uri);
    res.json({ contents });
  } catch (error) {
    console.error('리소스 읽기 에러:', error);
    res.status(500).json({ error: '리소스 읽기 실패' });
  }
});

// 주간 챌린지 생성 API
app.post('/api/weekly-challenge', async (req, res) => {
  try {
    const { theme, interests, duration } = req.body;
    
    if (!theme || !interests) {
      return res.status(400).json({ error: '테마와 관심사가 필요합니다.' });
    }

    const interestsArray = interests.split(',').map(i => i.trim());
    const result = await mcpClient.generateWeeklyChallenge(theme, interestsArray, duration);
    
    res.json({
      success: true,
      content: result[0].text
    });
    
  } catch (error) {
    console.error('주간 챌린지 생성 에러:', error);
    res.status(500).json({ error: '챌린지 생성 실패' });
  }
});

// 동기부여 부스터 API
app.post('/api/motivation-booster', async (req, res) => {
  try {
    const { currentProgress, mood, interests } = req.body;
    
    if (!currentProgress || !mood || !interests) {
      return res.status(400).json({ error: '모든 필드가 필요합니다.' });
    }

    const interestsArray = interests.split(',').map(i => i.trim());
    const result = await mcpClient.createMotivationBooster(currentProgress, mood, interestsArray);
    
    res.json({
      success: true,
      content: result[0].text
    });
    
  } catch (error) {
    console.error('동기부여 부스터 생성 에러:', error);
    res.status(500).json({ error: '동기부여 부스터 생성 실패' });
  }
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키가 설정되었는지 확인하세요.');
  
  // MCP 초기화
  await initializeMCP();
});

// 프로세스 종료 시 MCP 연결 해제
process.on('SIGINT', async () => {
  console.log('\n🔄 서버 종료 중...');
  await mcpClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 서버 종료 중...');
  await mcpClient.disconnect();
  process.exit(0);
}); 
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

// MCP 클라이언트 import
import MCPCompressedRoutineClient from './mcp-client.js';

// MCP 클라이언트 인스턴스
let mcpClient = null;

// MCP 클라이언트 초기화
async function initializeMCPClient() {
  try {
    mcpClient = new MCPCompressedRoutineClient();
    const connected = await mcpClient.connect();
    if (connected) {
      console.log("MCP 클라이언트가 성공적으로 초기화되었습니다.");
    } else {
      console.error("MCP 클라이언트 초기화 실패");
    }
  } catch (error) {
    console.error("MCP 클라이언트 초기화 중 오류:", error);
  }
}

// 압축 루틴 전략가 API 엔드포인트 (MCP 기반)
app.post('/api/compressed-routine', async (req, res) => {
  try {
    const { goal, weeklyTime, duration } = req.body;
    
    if (!goal || !weeklyTime || !duration) {
      return res.status(400).json({ error: '목표, 주간 시간, 기간이 모두 필요합니다.' });
    }

    if (!mcpClient) {
      await initializeMCPClient();
    }

    if (!mcpClient) {
      return res.status(500).json({ error: 'MCP 클라이언트를 초기화할 수 없습니다.' });
    }

    // MCP를 통해 압축 루틴 생성
    const result = await mcpClient.generateCompressedRoutine(goal, weeklyTime, duration);
    
    // 결과를 HTML 형식으로 파싱
    const parsedResult = parseMCPResult(result);
    
    res.json(parsedResult);
  } catch (error) {
    console.error('MCP 서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류: ' + error.message });
  }
});

// MCP 결과를 HTML 형식으로 파싱하는 함수
function parseMCPResult(text) {
  const sections = text.split('## ');
  
  let weeklyStrategy = '';
  let routineSummary = '';
  let timeTips = '';
  
  sections.forEach(section => {
    if (section.includes('📅 주차별 집중 테마와 학습목표')) {
      weeklyStrategy = section.replace('📅 주차별 집중 테마와 학습목표', '').trim();
    } else if (section.includes('⏰ 핵심 실행 루틴')) {
      routineSummary = section.replace('⏰ 핵심 실행 루틴', '').trim();
    } else if (section.includes('💡 시간 절약 팁')) {
      timeTips = section.replace('💡 시간 절약 팁', '').trim();
    }
  });
  
  return {
    goal: '사용자 목표',
    weeklyTime: 0,
    duration: 0,
    weeklyStrategy: weeklyStrategy ? `<div class="week-plan">${weeklyStrategy}</div>` : '',
    routineSummary: routineSummary ? `<div class="routine-summary">${routineSummary}</div>` : '',
    timeTips: timeTips ? `<div class="time-tips">${timeTips}</div>` : ''
  };
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키가 설정되었는지 확인하세요.');
}); 
// 👇 맨 위에 추가!
require('dotenv').config();

// 필요한 모듈
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// OpenAI 클라이언트 조건부 초기화
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const { OpenAI } = require("openai");
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log("🔐 OpenAI API 키가 설정되었습니다.");
} else {
  console.log("⚠️ OpenAI API 키가 설정되지 않았습니다. 피드백 기능은 제한적으로 작동합니다.");
}

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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API 키가 설정되지 않았습니다.' });
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

// Feedback Agent 엔드포인트 추가
app.post('/api/feedback', async (req, res) => {
  try {
    const { goal, weekly_plan, executed_tasks, self_reflection } = req.body;
    
    if (!goal || !weekly_plan || !executed_tasks || !self_reflection) {
      return res.status(400).json({ error: '모든 필수 데이터가 필요합니다.' });
    }

    // 목표 달성도 계산
    const totalTasks = Object.keys(executed_tasks).length;
    const completedTasks = Object.values(executed_tasks).filter(status => 
      status === '완료' || status.includes('실행함')
    ).length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);

    // OpenAI API 키가 없는 경우 기본 피드백 생성
    if (!openai) {
      const defaultFeedback = generateDefaultFeedback(goal, weekly_plan, executed_tasks, self_reflection, completionRate);
      return res.json({
        success: true,
        feedback: defaultFeedback,
        raw_content: "기본 피드백이 생성되었습니다."
      });
    }

    // Feedback Agent 프롬프트 구성
    const feedbackPrompt = `
🧠 역할: 
너는 사용자의 학습 루틴에 대한 **피드백 코치** 역할을 맡은 Feedback Agent야.
Scheduler Agent가 설계한 실행 루틴이 완료된 후, 사용자의 결과와 자기 평가 내용을 바탕으로 **성찰**, **강점 및 개선점 분석**, **다음 주 전략에 반영할 인사이트**를 도출해 줘.

💬 말투: 
공감하면서도 구체적인 피드백을 제공해. 사용자가 기분 나쁘지 않게 **성장 지향적** 피드백을 줘.
(ex. "이번 주 목표 달성에 80% 이상 도달했어요! 특히 XX가 인상 깊었어요. 다음엔 OO을 조금 더 신경 써보면 좋겠어요.")

📥 입력 데이터:
- 목표: ${goal}
- 주간 계획: ${JSON.stringify(weekly_plan)}
- 실행된 작업: ${JSON.stringify(executed_tasks)}
- 자기 성찰: ${self_reflection}
- 목표 달성도: ${completionRate}%

위 데이터를 바탕으로 다음 형식으로 피드백을 제공해줘:

## 📊 이번 주 성과 분석
- 목표 달성도와 주요 성과

## 🌟 강점 분석
- 사용자의 강점과 잘한 점들

## 🔧 개선점 및 제안사항
- 구체적인 개선 방안

## 💡 다음 주 전략 인사이트
- 다음 주에 적용할 수 있는 전략

## 🌱 성장 마인드셋
- 격려와 동기부여 메시지

JSON 형식으로 응답해주세요:
{
  "completion_rate": ${completionRate},
  "performance_analysis": "성과 분석 내용",
  "strengths": ["강점1", "강점2", "강점3"],
  "improvements": ["개선점1", "개선점2", "개선점3"],
  "next_week_strategy": "다음 주 전략",
  "growth_message": "성장 마인드셋 메시지"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 학습 루틴 피드백 전문가입니다. 사용자의 성장을 돕는 긍정적이고 구체적인 피드백을 제공하세요.'
        },
        {
          role: 'user',
          content: feedbackPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const feedbackContent = response.choices[0].message.content;
    
    // JSON 파싱 시도
    try {
      const feedbackData = JSON.parse(feedbackContent);
      res.json({
        success: true,
        feedback: feedbackData,
        raw_content: feedbackContent
      });
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 텍스트 반환
      res.json({
        success: true,
        feedback: {
          completion_rate: completionRate,
          performance_analysis: "성과 분석을 생성했습니다.",
          strengths: ["실행력", "자기 성찰 능력"],
          improvements: ["일정 분배", "지속성"],
          next_week_strategy: "다음 주 전략을 제안합니다.",
          growth_message: "계속해서 성장해나가세요!"
        },
        raw_content: feedbackContent
      });
    }

  } catch (error) {
    console.error('Feedback Agent 에러:', error);
    res.status(500).json({ 
      error: '피드백 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 기본 피드백 생성 함수
function generateDefaultFeedback(goal, weekly_plan, executed_tasks, self_reflection, completionRate) {
  const strengths = [];
  const improvements = [];
  
  // 강점 분석
  if (completionRate >= 80) {
    strengths.push("뛰어난 실행력과 계획 달성 능력");
  } else if (completionRate >= 60) {
    strengths.push("적당한 실행력과 지속성");
  } else {
    strengths.push("도전 정신과 학습 의지");
  }
  
  if (self_reflection.length > 50) {
    strengths.push("자기 성찰 능력이 뛰어남");
  }
  
  // 개선점 분석
  if (completionRate < 80) {
    improvements.push("일정 관리 및 우선순위 설정 개선");
  }
  
  if (self_reflection.includes("시간") || self_reflection.includes("일정")) {
    improvements.push("시간 분배 최적화");
  }
  
  if (self_reflection.includes("지치") || self_reflection.includes("힘들")) {
    improvements.push("지속 가능한 학습 패턴 구축");
  }
  
  // 기본값 설정
  if (strengths.length === 0) strengths.push("학습에 대한 긍정적인 태도");
  if (improvements.length === 0) improvements.push("일관성 있는 학습 습관 형성");
  
  return {
    completion_rate: completionRate,
    performance_analysis: `이번 주 목표 달성도는 ${completionRate}%입니다. ${completionRate >= 70 ? '훌륭한 성과를 보여주셨네요!' : '개선의 여지가 있습니다.'}`,
    strengths: strengths,
    improvements: improvements,
    next_week_strategy: "다음 주에는 더 체계적인 계획과 함께 지속 가능한 학습 루틴을 만들어보세요.",
    growth_message: "매일 조금씩이라도 꾸준히 하는 것이 큰 변화를 만들어냅니다. 계속해서 성장해나가세요! 💪"
  };
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  if (process.env.OPENAI_API_KEY) {
    console.log('OpenAI API 키가 설정되었습니다.');
  } else {
    console.log('⚠️ OpenAI API 키가 설정되지 않았습니다. 기본 피드백 기능만 사용 가능합니다.');
  }
}); 
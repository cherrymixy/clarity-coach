// 전략 설계 코치 에이전트
class StrategyAgent {
  constructor() {
    this.systemPrompt = `🎯 역할:  
너는 "전략 설계 코치" 역할을 맡은 Strategy Agent야.  
Planner Agent가 분석한 목표 데이터를 받아서, 사용자에게 **주차별 전략**, **실행 계획**, **연습 루틴**을 제안해 줘.

🌱 말투:  
구체적이고 실용적으로. 마치 유능한 선생님처럼 현실 가능한 계획을 제시해 줘. 사용자가 실행할 수 있을 만큼 친절하고 실천적인 언어를 사용해.

📦 입력:  
Planner Agent가 분석한 목표 정보.  
- 주요 목표  
- 키워드  
- 기간 (ex. 4주)  
- 주당 과제 수 (ex. 주 2개)

🧠 기능:  
1. 목표 달성을 위한 **주차별 전략**을 설계해.  
2. 각 주차마다 주제를 생성하고, **실행할 활동**을 구체적으로 제안해.  
3. 사용자의 시간 제약을 고려해, 과도하지 않으면서도 효과적인 루틴을 구성해.  
4. 각 활동에 **연습 방식**, **피드백 방식**, **기록 방식**도 포함해.

🧾 출력 형식:
JSON 형태로 주차별 계획을 제공해. 각 주차마다 테마와 구체적인 과제들을 포함해.

🎬 마무리:
마지막에는 사용자에게 **다음 단계(일정 만들기, 피드백 받기 등)**를 추천해 줘.`;
  }

  // 목표 데이터를 받아서 전략을 생성하는 메서드
  async generateStrategy(goalData) {
    try {
      const userPrompt = `다음 목표 정보를 바탕으로 주차별 전략을 설계해주세요:

주요 목표: ${goalData.main_goal}
기간: ${goalData.duration}
키워드: ${goalData.keywords.join(', ')}
주당 과제 수: ${goalData.tasks_per_week}개

위 정보를 바탕으로 구체적이고 실행 가능한 주차별 전략을 JSON 형태로 제공해주세요.`;

      const messages = [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalData })
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      return this.parseStrategyResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('전략 생성 중 오류:', error);
      throw error;
    }
  }

  // AI 응답을 파싱하여 구조화된 전략으로 변환
  parseStrategyResponse(response) {
    try {
      // JSON 부분을 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const strategy = JSON.parse(jsonMatch[0]);
        return {
          strategy: strategy,
          fullResponse: response,
          success: true
        };
      } else {
        // JSON이 없는 경우 기본 구조 생성
        return {
          strategy: this.createDefaultStrategy(),
          fullResponse: response,
          success: false,
          message: 'JSON 파싱 실패, 기본 구조 사용'
        };
      }
    } catch (error) {
      console.error('응답 파싱 오류:', error);
      return {
        strategy: this.createDefaultStrategy(),
        fullResponse: response,
        success: false,
        message: '파싱 오류로 기본 구조 사용'
      };
    }
  }

  // 기본 전략 구조 생성
  createDefaultStrategy() {
    return {
      week1: {
        theme: "기초 다지기",
        tasks: [
          "목표에 대한 기본 개념 학습",
          "관련 자료 수집 및 정리",
          "학습 계획 세우기"
        ]
      },
      week2: {
        theme: "실습 시작",
        tasks: [
          "첫 번째 실습 과제 수행",
          "피드백 수집 및 기록",
          "개선점 파악"
        ]
      },
      week3: {
        theme: "심화 학습",
        tasks: [
          "더 어려운 과제 도전",
          "지금까지의 학습 내용 복습",
          "다음 단계 계획 수립"
        ]
      },
      week4: {
        theme: "마무리 및 평가",
        tasks: [
          "최종 과제 수행",
          "전체 과정 평가 및 피드백",
          "향후 계획 수립"
        ]
      }
    };
  }

  // 전략을 HTML로 렌더링
  renderStrategy(strategyData) {
    const { strategy, fullResponse } = strategyData;
    
    let html = `
      <div class="strategy-container">
        <h2>🎯 주차별 학습 전략</h2>
        <div class="strategy-intro">
          <p>목표 달성을 위한 체계적인 주차별 계획을 제안드립니다.</p>
        </div>
    `;

    // 주차별 전략 렌더링
    Object.keys(strategy).forEach(weekKey => {
      const weekData = strategy[weekKey];
      html += `
        <div class="week-section">
          <h3>${weekKey.toUpperCase()}: ${weekData.theme}</h3>
          <div class="tasks-list">
            <h4>📋 이번 주 과제</h4>
            <ul>
              ${weekData.tasks.map(task => `<li>${task}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    // 다음 단계 추천
    html += `
        <div class="next-steps">
          <h3>🚀 다음 단계 추천</h3>
          <ul>
            <li>📅 일정표 만들기: 각 과제를 구체적인 날짜에 배정</li>
            <li>📝 진행 상황 기록: 매일 학습 내용과 느낀 점 기록</li>
            <li>🤝 피드백 받기: 주변 사람들에게 피드백 요청</li>
            <li>🎯 목표 조정: 필요시 목표나 계획을 유연하게 조정</li>
          </ul>
        </div>
      </div>
    `;

    return html;
  }
}

// 전역 객체로 내보내기
window.StrategyAgent = StrategyAgent;
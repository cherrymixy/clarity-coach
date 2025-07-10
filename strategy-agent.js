// Strategy Agent - 주간 전략 생성
// GPT API를 사용해서 사용자 목표에 맞는 개인화된 주간 전략을 생성

class StrategyAgent {
  constructor() {
    this.apiEndpoint = '/api/gpt';
  }

  // GPT API를 통해 주간 전략 생성
  async generateWeeklyStrategy(goal, weekNumber = 1) {
    try {
      const prompt = this.createStrategyPrompt(goal, weekNumber);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `당신은 전문적인 학습 전략가입니다. 사용자의 목표에 맞는 체계적이고 실천 가능한 주간 학습 전략을 생성해주세요. 
              
              다음 형식으로 JSON 응답을 제공해주세요:
              {
                "strategyType": "전략 타입 (체계적 계획형/실습 중심 몰입형/감각적 체험형)",
                "strategyTitle": "전략 제목",
                "strategyDescription": "전략 설명",
                "dailyTasks": [
                  {
                    "title": "일차별 제목",
                    "details": {
                      "목표": "구체적인 목표",
                      "방법": "실행 방법",
                      "예상시간": "예상 소요 시간",
                      "주의할 점": "주의사항",
                      "피드백": "하루 마무리 피드백"
                    }
                  }
                ]
              }`
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        // JSON 파싱 시도
        try {
          const strategyData = JSON.parse(content);
          return this.validateAndFormatStrategy(strategyData, goal, weekNumber);
        } catch (parseError) {
          console.error('JSON 파싱 실패:', parseError);
          // 파싱 실패 시 기본 전략 반환
          return this.createDefaultStrategy(goal, weekNumber);
        }
      } else {
        throw new Error('API 응답 형식 오류');
      }
    } catch (error) {
      console.error('Strategy Agent 에러:', error);
      // 에러 시 기본 전략 반환
      return this.createDefaultStrategy(goal, weekNumber);
    }
  }

  // 전략 생성 프롬프트 생성
  createStrategyPrompt(goal, weekNumber) {
    return `다음 목표에 대한 ${weekNumber}주차 주간 학습 전략을 생성해주세요:

목표: ${goal}

요구사항:
1. 5일간의 구체적인 일일 계획 (월~금)
2. 각 일차별로 실천 가능한 목표와 방법 제시
3. 예상 소요 시간과 주의사항 포함
4. 하루 마무리 피드백 포함
5. 사용자의 학습 스타일에 맞는 접근법 선택

전략 타입 중 하나를 선택해서 적용해주세요:
- 체계적 계획형: 체계적이고 계획을 세우는 것을 좋아하는 사람
- 실습 중심 몰입형: 즉시 실습하고 경험을 통해 배우는 것을 선호하는 사람  
- 감각적 체험형: 감각적 경험과 직관을 중요시하는 사람

JSON 형식으로 응답해주세요.`;
  }

  // 전략 데이터 검증 및 포맷팅
  validateAndFormatStrategy(strategyData, goal, weekNumber) {
    // 필수 필드 검증
    const requiredFields = ['strategyType', 'strategyTitle', 'strategyDescription', 'dailyTasks'];
    for (const field of requiredFields) {
      if (!strategyData[field]) {
        throw new Error(`필수 필드 누락: ${field}`);
      }
    }

    // dailyTasks 검증 및 보완
    if (!Array.isArray(strategyData.dailyTasks) || strategyData.dailyTasks.length === 0) {
      throw new Error('dailyTasks가 배열이 아니거나 비어있음');
    }

    // 5일치 데이터로 확장
    const expandedTasks = this.expandToFiveDays(strategyData.dailyTasks, goal);

    return {
      strategyType: strategyData.strategyType,
      strategyTitle: strategyData.strategyTitle,
      strategyDescription: strategyData.strategyDescription,
      weekNumber: weekNumber,
      goal: goal,
      dailyTasks: expandedTasks
    };
  }

  // 5일치 데이터로 확장
  expandToFiveDays(tasks, goal) {
    const weekdays = ['월', '화', '수', '목', '금'];
    const expandedTasks = [];

    weekdays.forEach((day, index) => {
      const originalTask = tasks[index] || tasks[0]; // 기본값 처리
      
      expandedTasks.push({
        day: day,
        dayNumber: index + 1,
        title: originalTask.title,
        details: {
          "목표": originalTask.details?.목표 || `${goal} 관련 학습 진행`,
          "방법": originalTask.details?.방법 || "체계적인 학습 방법 적용",
          "예상시간": originalTask.details?.예상시간 || "1-2시간",
          "주의할 점": originalTask.details?.주의할 점 || "무리하지 않고 꾸준히 진행",
          "피드백": originalTask.details?.피드백 || "하루 학습 내용 정리 및 다음 날 계획 수립"
        }
      });
    });

    return expandedTasks;
  }

  // 기본 전략 생성 (API 실패 시)
  createDefaultStrategy(goal, weekNumber) {
    return {
      strategyType: '체계적 계획형',
      strategyTitle: '🎯 체계적 계획형 접근법',
      strategyDescription: '체계적이고 계획을 세우는 것을 좋아하는 사람에게 적합',
      weekNumber: weekNumber,
      goal: goal,
      dailyTasks: [
        {
          day: '월',
          dayNumber: 1,
          title: "목표 분석 및 세부 계획 수립",
          details: {
            "목표": `${goal}에 대한 구체적인 세부 목표 설정`,
            "방법": "마인드맵 작성, 일정표 제작",
            "예상시간": "2시간",
            "주의할 점": "너무 완벽주의적이 되지 않기",
            "피드백": "하루 마무리 시 계획의 실현 가능성 점검"
          }
        },
        {
          day: '화',
          dayNumber: 2,
          title: "학습 환경 구축",
          details: {
            "목표": "효율적인 학습 공간과 도구 준비",
            "방법": "학습 공간 정리, 필요한 자료 수집",
            "예상시간": "1.5시간",
            "주의할 점": "과도한 준비에 시간 낭비하지 않기",
            "피드백": "준비된 환경이 실제 학습에 도움이 되는지 확인"
          }
        },
        {
          day: '수',
          dayNumber: 3,
          title: "첫 번째 실습 시작",
          details: {
            "목표": "계획에 따른 첫 번째 학습 세션 진행",
            "방법": "설정한 시간에 맞춰 학습 시작",
            "예상시간": "1-3시간",
            "주의할 점": "완벽하지 않아도 괜찮다는 마음가짐",
            "피드백": "학습 후 느낀 점과 개선점 기록"
          }
        },
        {
          day: '목',
          dayNumber: 4,
          title: "진행 상황 점검 및 조정",
          details: {
            "목표": "지금까지의 진행 상황을 점검하고 필요시 계획 조정",
            "방법": "일일 기록 검토, 다음 단계 계획 수정",
            "예상시간": "1시간",
            "주의할 점": "너무 자주 계획을 바꾸지 않기",
            "피드백": "계획 조정이 실제로 도움이 되었는지 평가"
          }
        },
        {
          day: '금',
          dayNumber: 5,
          title: "주간 성과 정리 및 다음 주 계획",
          details: {
            "목표": "이번 주 성과를 정리하고 다음 주 계획 수립",
            "방법": "성과 기록, 다음 주 목표 설정",
            "예상시간": "1.5시간",
            "주의할 점": "성과에만 집중하지 말고 과정도 평가하기",
            "피드백": "전체적인 학습 방향이 올바른지 점검"
          }
        }
      ]
    };
  }
}
}

// 전역 객체로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StrategyAgent;
} else {
  window.StrategyAgent = StrategyAgent;
}
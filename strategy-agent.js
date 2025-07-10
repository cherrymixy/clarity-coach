// Strategy Agent - Modal Context Protocol (MCP) Implementation
class StrategyAgent {
  constructor() {
    this.role = "StrategyAgent";
    this.intent = "Deliver weekly strategy for user goal";
  }

  // MCP 형식으로 Planner Agent로부터 데이터를 받아서 전략 생성
  async generateStrategy(plannerData) {
    try {
      // Planner Agent의 MCP 메시지 파싱
      const parsedData = this.parsePlannerMessage(plannerData);
      
      // MCP 형식의 전략 생성
      const strategyResponse = await this.createMCPStrategy(parsedData);
      
      return strategyResponse;
    } catch (error) {
      console.error('Strategy Agent 오류:', error);
      return this.createErrorResponse(error.message);
    }
  }

  // Planner Agent의 MCP 메시지 파싱
  parsePlannerMessage(plannerData) {
    try {
      // Planner Agent가 MCP 형식으로 보낸 데이터 파싱
      if (typeof plannerData === 'string') {
        plannerData = JSON.parse(plannerData);
      }

      // MCP 형식 검증
      if (!plannerData.role || !plannerData.payload) {
        throw new Error('Invalid MCP message format from Planner Agent');
      }

      return {
        goal: plannerData.payload.goal || plannerData.context?.target_goal,
        timeline: plannerData.payload.timeline || plannerData.context?.timeline,
        difficulty: plannerData.payload.difficulty || 'intermediate',
        learning_style: plannerData.payload.learning_style || 'balanced',
        keywords: plannerData.payload.keywords || []
      };
    } catch (error) {
      console.error('Planner 메시지 파싱 오류:', error);
      // 기존 형식과의 호환성을 위한 fallback
      return {
        goal: plannerData.main_goal || plannerData.goal,
        timeline: plannerData.duration || '4주',
        difficulty: 'intermediate',
        learning_style: plannerData.strategy_name || 'balanced',
        keywords: plannerData.keywords || []
      };
    }
  }

  // MCP 형식의 전략 생성
  async createMCPStrategy(parsedData) {
    try {
      const { goal, timeline, difficulty, learning_style, keywords } = parsedData;
      
      // 주차 수 계산
      const weekCount = this.calculateWeekCount(timeline);
      
      // 학습 스타일에 따른 전략 생성
      const strategy = this.generateWeeklyStrategy(goal, weekCount, difficulty, learning_style, keywords);
      
      // MCP 형식으로 응답 구성
      return {
        role: this.role,
        intent: this.intent,
        context: {
          from: "PlannerAgent",
          target_goal: goal,
          timeline: timeline,
          difficulty: difficulty,
          learning_style: learning_style
        },
        payload: {
          strategy: strategy,
          metadata: {
            total_weeks: weekCount,
            estimated_hours_per_week: this.calculateHoursPerWeek(difficulty),
            success_metrics: this.generateSuccessMetrics(goal)
          }
        }
      };
    } catch (error) {
      throw new Error(`Strategy generation failed: ${error.message}`);
    }
  }

  // 주차 수 계산
  calculateWeekCount(timeline) {
    const weekMatch = timeline.match(/(\d+)주/);
    return weekMatch ? parseInt(weekMatch[1]) : 4;
  }

  // 주당 예상 시간 계산
  calculateHoursPerWeek(difficulty) {
    const hoursMap = {
      'beginner': 3,
      'intermediate': 5,
      'advanced': 8
    };
    return hoursMap[difficulty] || 5;
  }

  // 학습 스타일에 따른 주차별 전략 생성
  generateWeeklyStrategy(goal, weekCount, difficulty, learning_style, keywords) {
    const strategies = {
      '체계적 계획형': this.generateSystematicStrategy,
      '실습 중심 몰입형': this.generatePracticalStrategy,
      '감각적 체험형': this.generateSensoryStrategy,
      'balanced': this.generateBalancedStrategy
    };

    const strategyGenerator = strategies[learning_style] || strategies['balanced'];
    return strategyGenerator.call(this, goal, weekCount, difficulty, keywords);
  }

  // 체계적 계획형 전략
  generateSystematicStrategy(goal, weekCount, difficulty, keywords) {
    const strategy = [];
    
    for (let week = 1; week <= weekCount; week++) {
      let step = '';
      
      if (week === 1) {
        step = `목표 분석 및 기초 지식 습득: ${goal}에 대한 체계적인 분석과 기본 개념 학습`;
      } else if (week === 2) {
        step = `학습 계획 수립 및 환경 구축: 상세한 학습 일정표 작성과 효율적인 학습 환경 조성`;
      } else if (week === weekCount) {
        step = `최종 평가 및 성과 측정: 전체 학습 과정의 성과를 평가하고 향후 계획 수립`;
      } else {
        step = `단계별 심화 학습 및 실습: ${week-1}주차 학습 내용을 바탕으로 한 심화 과정 진행`;
      }
      
      strategy.push(`Week ${week}: ${step}`);
    }
    
    return strategy;
  }

  // 실습 중심 몰입형 전략
  generatePracticalStrategy(goal, weekCount, difficulty, keywords) {
    const strategy = [];
    
    for (let week = 1; week <= weekCount; week++) {
      let step = '';
      
      if (week === 1) {
        step = `즉시 실습 시작: ${goal}과 관련된 실제 프로젝트나 과제를 바로 시작하여 경험 축적`;
      } else if (week === 2) {
        step = `실습 기반 개선 및 확장: 1주차 실습에서 발견한 개선점을 적용하여 더 큰 규모로 확장`;
      } else if (week === weekCount) {
        step = `최종 실습 및 포트폴리오 완성: 지금까지의 실습 경험을 바탕으로 최종 결과물 완성`;
      } else {
        step = `실습 난이도 상향 조정: 이전 주차의 성과를 바탕으로 더 도전적인 실습 과제 수행`;
      }
      
      strategy.push(`Week ${week}: ${step}`);
    }
    
    return strategy;
  }

  // 감각적 체험형 전략
  generateSensoryStrategy(goal, weekCount, difficulty, keywords) {
    const strategy = [];
    
    for (let week = 1; week <= weekCount; week++) {
      let step = '';
      
      if (week === 1) {
        step = `감각적 연결과 동기 부여: ${goal}에 대한 감정적 연결을 찾고 학습 동기 강화`;
      } else if (week === 2) {
        step = `감각적 학습 환경 조성: 시각, 청각, 촉각적 요소를 활용한 몰입형 학습 환경 구축`;
      } else if (week === weekCount) {
        step = `감각적 성과 평가 및 정리: 학습 과정에서 느낀 감각적 경험을 바탕으로 한 성과 평가`;
      } else {
        step = `감각적 피드백을 통한 학습 조정: 학습 중 느끼는 감각적 신호를 관찰하여 방법론 개선`;
      }
      
      strategy.push(`Week ${week}: ${step}`);
    }
    
    return strategy;
  }

  // 균형잡힌 전략 (기본값)
  generateBalancedStrategy(goal, weekCount, difficulty, keywords) {
    const strategy = [];
    
    for (let week = 1; week <= weekCount; week++) {
      let step = '';
      
      if (week === 1) {
        step = `목표 이해 및 기초 다지기: ${goal}에 대한 전반적인 이해와 기본 개념 학습`;
      } else if (week === 2) {
        step = `실습과 이론의 균형: 학습한 이론을 바탕으로 한 실습과 피드백 수집`;
      } else if (week === weekCount) {
        step = `종합 평가 및 마무리: 전체 학습 과정의 성과를 종합적으로 평가하고 정리`;
      } else {
        step = `단계적 심화 및 적용: 이전 주차의 학습 내용을 바탕으로 한 심화 과정과 실제 적용`;
      }
      
      strategy.push(`Week ${week}: ${step}`);
    }
    
    return strategy;
  }

  // 성공 지표 생성
  generateSuccessMetrics(goal) {
    return [
      "주차별 목표 달성도 측정",
      "학습 내용의 실제 적용 가능성 평가",
      "지속적인 동기 부여 유지",
      "피드백 기반 개선 사항 반영"
    ];
  }

  // 에러 응답 생성
  createErrorResponse(errorMessage) {
    return {
      role: this.role,
      intent: "Error handling",
      context: {
        from: "StrategyAgent",
        error: true
      },
      payload: {
        error: errorMessage,
        strategy: [
          "Week 1: 기본 학습 계획 수립",
          "Week 2: 단계별 실습 진행",
          "Week 3: 성과 평가 및 개선"
        ]
      }
    };
  }

  // MCP 응답을 HTML로 렌더링
  renderMCPStrategy(mcpResponse) {
    const { context, payload } = mcpResponse;
    
    let html = `
      <div class="strategy-container">
        <h2>🎯 Strategy Agent - 주차별 학습 전략</h2>
        <div class="strategy-intro">
          <p><strong>목표:</strong> ${context.target_goal}</p>
          <p><strong>기간:</strong> ${context.timeline}</p>
          <p><strong>난이도:</strong> ${context.difficulty}</p>
          <p><strong>학습 스타일:</strong> ${context.learning_style}</p>
        </div>
    `;

    // 주차별 전략 렌더링
    payload.strategy.forEach((weekStep, index) => {
      const weekNumber = index + 1;
      const stepDescription = weekStep.replace(`Week ${weekNumber}: `, '');
      
      html += `
        <div class="week-section">
          <h3>Week ${weekNumber}</h3>
          <div class="tasks-list">
            <p>${stepDescription}</p>
          </div>
        </div>
      `;
    });

    // 메타데이터 표시
    if (payload.metadata) {
      html += `
        <div class="metadata-section">
          <h3>� 학습 정보</h3>
          <ul>
            <li><strong>총 주차:</strong> ${payload.metadata.total_weeks}주</li>
            <li><strong>주당 예상 시간:</strong> ${payload.metadata.estimated_hours_per_week}시간</li>
            <li><strong>성공 지표:</strong></li>
            <ul>
              ${payload.metadata.success_metrics.map(metric => `<li>${metric}</li>`).join('')}
            </ul>
          </ul>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }
}

// 전역 객체로 내보내기
window.StrategyAgent = StrategyAgent;
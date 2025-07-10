// Scheduler Agent - MCP 형식 일일 스케줄 생성
// Strategy Agent가 MCP 형식으로 전달한 정보를 받아서 실행 가능한 일일 계획 생성

class SchedulerAgent {
  constructor() {
    this.availableHours = {
      start: 9, // 오전 9시
      end: 18   // 오후 6시
    };
    this.dailyStudyTime = 3; // 하루 3시간 학습 (기본값)
    this.breakTime = 30; // 쉬는 시간 30분
  }

  // MCP 형식 데이터를 받아서 일일 스케줄 생성
  generateDailyScheduleFromMCP(mcpData, customSettings = {}) {
    const {
      goal,
      duration,
      weekly_plan
    } = mcpData;

    // 사용자 설정 적용
    if (customSettings.availableHours) {
      this.availableHours = customSettings.availableHours;
    }
    if (customSettings.dailyStudyTime) {
      this.dailyStudyTime = customSettings.dailyStudyTime;
    }

    const weeklySchedule = {
      goal: goal,
      duration: duration,
      weekNumber: weekly_plan.week,
      objectives: weekly_plan.objectives,
      dailySchedules: {}
    };

    // 요일별 일정 생성
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const koreanWeekdays = ['월', '화', '수', '목', '금', '토', '일'];
    
    weekdays.forEach((day, index) => {
      const koreanDay = koreanWeekdays[index];
      const dayStep = weekly_plan.steps[day];
      
      if (dayStep) {
        weeklySchedule.dailySchedules[koreanDay] = this.createDayScheduleFromMCP(
          koreanDay, 
          index + 1, 
          dayStep,
          goal,
          weekly_plan.objectives
        );
      }
    });

    return weeklySchedule;
  }

  // MCP 데이터로 하루 일정 생성
  createDayScheduleFromMCP(day, dayNumber, dayStep, goal, objectives) {
    const schedule = {
      day: day,
      dayNumber: dayNumber,
      title: this.generateFriendlyTitle(dayStep, day),
      goal: dayStep,
      mainObjective: this.findRelevantObjective(dayStep, objectives),
      activities: [],
      breaks: [],
      motivation: this.generateMotivation(day, dayStep, goal),
      tips: this.generateTips(dayStep, day)
    };

    // 활동 분해 및 시간 배치
    const activities = this.decomposeActivity(dayStep, day);
    
    // 시간대별로 활동 배치
    let currentTime = this.availableHours.start;
    let activityIndex = 0;
    let breakCount = 0;

    while (currentTime < this.availableHours.end && activityIndex < activities.length) {
      const activity = activities[activityIndex];
      
      // 활동 시간 계산
      const activityDuration = this.calculateActivityDuration(activity, day);
      
      // 활동 추가
      schedule.activities.push({
        time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + activityDuration)}`,
        title: activity.title,
        description: activity.description,
        duration: activityDuration,
        type: activity.type,
        friendlyDescription: this.makeFriendlyDescription(activity, day)
      });

      currentTime += activityDuration;
      activityIndex++;

      // 쉬는 시간 추가 (2시간마다 또는 활동 후)
      if (breakCount < 2 && currentTime < this.availableHours.end - 1) {
        const breakDuration = 0.5; // 30분
        schedule.breaks.push({
          time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + breakDuration)}`,
          description: "휴식 및 정리 시간",
          duration: breakDuration,
          friendlyDescription: this.generateBreakMessage(day, breakCount)
        });
        currentTime += breakDuration;
        breakCount++;
      }
    }

    return schedule;
  }

  // 친근한 제목 생성
  generateFriendlyTitle(dayStep, day) {
    const dayNames = {
      '월': '월요일',
      '화': '화요일', 
      '수': '수요일',
      '목': '목요일',
      '금': '금요일',
      '토': '토요일',
      '일': '일요일'
    };

    const dayName = dayNames[day];
    
    if (dayStep.includes('연구') || dayStep.includes('조사')) {
      return `${dayName}에는 ${dayStep.split('에')[0]}부터 가볍게 시작해볼까요?`;
    } else if (dayStep.includes('작성') || dayStep.includes('정리')) {
      return `${dayName}에는 ${dayStep.split('자료')[0]}자료를 차근차근 정리해보세요`;
    } else if (dayStep.includes('연습')) {
      return `${dayName}에는 실제 연습을 통해 실력을 키워보세요`;
    } else if (dayStep.includes('평가') || dayStep.includes('피드백')) {
      return `${dayName}에는 지금까지의 성과를 돌아보는 시간을 가져보세요`;
    } else {
      return `${dayName}에는 ${dayStep}을 진행해보세요`;
    }
  }

  // 관련 목표 찾기
  findRelevantObjective(dayStep, objectives) {
    for (const objective of objectives) {
      if (dayStep.includes(objective.split(' ')[0]) || 
          objective.includes(dayStep.split(' ')[0])) {
        return objective;
      }
    }
    return objectives[0] || '주간 목표 달성';
  }

  // 동기부여 메시지 생성
  generateMotivation(day, dayStep, goal) {
    const motivations = {
      '월': `새로운 한 주의 시작! ${goal}을 향한 첫 걸음을 내딛어보세요.`,
      '화': `어제의 기운을 이어서 ${dayStep}에 집중해보세요.`,
      '수': `중간점검의 날! 지금까지의 진행상황을 점검하고 조정해보세요.`,
      '목': `마무리를 향해 달려가는 중! ${dayStep}을 통해 한 걸음 더 나아가세요.`,
      '금': `이번 주의 마지막 학습일! ${dayStep}을 통해 성과를 만들어보세요.`,
      '토': `주말에도 꾸준히! ${dayStep}을 통해 실력을 다져보세요.`,
      '일': `일주일을 마무리하는 날! ${dayStep}을 통해 다음 주를 준비해보세요.`
    };
    
    return motivations[day] || `오늘도 ${goal}을 향해 한 걸음씩 나아가보세요!`;
  }

  // 활동 분해
  decomposeActivity(dayStep, day) {
    const activities = [];

    if (dayStep.includes('연구') || dayStep.includes('조사')) {
      activities.push(
        {
          title: "자료 탐색 및 조사",
          description: dayStep,
          type: "research"
        },
        {
          title: "핵심 내용 정리",
          description: "조사한 내용을 체계적으로 정리",
          type: "organize"
        },
        {
          title: "다음 단계 계획",
          description: "수집한 자료를 바탕으로 다음 단계 계획",
          type: "planning"
        }
      );
    } else if (dayStep.includes('작성') || dayStep.includes('정리')) {
      activities.push(
        {
          title: "개요 작성",
          description: "전체적인 구조와 흐름 설계",
          type: "planning"
        },
        {
          title: "내용 작성",
          description: dayStep,
          type: "writing"
        },
        {
          title: "검토 및 수정",
          description: "작성한 내용 검토 및 개선",
          type: "review"
        }
      );
    } else if (dayStep.includes('연습')) {
      activities.push(
        {
          title: "연습 환경 준비",
          description: "연습에 필요한 도구와 환경 설정",
          type: "preparation"
        },
        {
          title: "실제 연습",
          description: dayStep,
          type: "practice"
        },
        {
          title: "피드백 수집",
          description: "연습 결과 분석 및 개선점 파악",
          type: "feedback"
        }
      );
    } else if (dayStep.includes('평가') || dayStep.includes('피드백')) {
      activities.push(
        {
          title: "성과 점검",
          description: "지금까지의 진행상황 종합 평가",
          type: "evaluation"
        },
        {
          title: "피드백 수집",
          description: dayStep,
          type: "feedback"
        },
        {
          title: "다음 주 계획",
          description: "피드백을 바탕으로 다음 주 계획 수립",
          type: "planning"
        }
      );
    } else {
      activities.push(
        {
          title: dayStep,
          description: dayStep,
          type: "general"
        }
      );
    }

    return activities;
  }

  // 활동별 시간 계산
  calculateActivityDuration(activity, day) {
    const baseDuration = 1; // 기본 1시간

    switch (activity.type) {
      case 'research':
        return 1.5;
      case 'organize':
        return 1;
      case 'planning':
        return 0.5;
      case 'writing':
        return 1.5;
      case 'review':
        return 1;
      case 'preparation':
        return 0.5;
      case 'practice':
        return 1.5;
      case 'feedback':
        return 0.5;
      case 'evaluation':
        return 1;
      default:
        return baseDuration;
    }
  }

  // 친근한 설명 생성
  makeFriendlyDescription(activity, day) {
    const descriptions = {
      'research': `${activity.description}을 통해 새로운 지식을 쌓아보세요.`,
      'organize': '수집한 정보를 체계적으로 정리해서 머릿속에 저장해보세요.',
      'planning': '다음 단계를 위한 계획을 세워보세요. 작은 목표부터 시작해도 괜찮아요.',
      'writing': `${activity.description}을 차근차근 작성해보세요. 완벽하지 않아도 괜찮아요.`,
      'review': '작성한 내용을 다시 한번 검토해보세요. 개선할 점을 찾아보세요.',
      'preparation': '연습에 필요한 환경을 준비해보세요. 편안한 마음으로 시작해보세요.',
      'practice': `${activity.description}을 실제로 연습해보세요. 실수해도 괜찮아요.`,
      'feedback': '다른 사람의 의견을 들어보세요. 다양한 관점을 받아들여보세요.',
      'evaluation': '지금까지의 노력을 돌아보세요. 성장한 부분을 확인해보세요.',
      'general': `${activity.description}을 진행해보세요. 차근차근 해나가면 됩니다.`
    };

    return descriptions[activity.type] || activity.description;
  }

  // 쉬는 시간 메시지 생성
  generateBreakMessage(day, breakCount) {
    const messages = [
      "잠시 쉬어가면서 지금까지의 내용을 정리해보세요.",
      "커피 한 잔과 함께 다음 활동을 준비해보세요.",
      "깊은 호흡을 하면서 집중력을 되찾아보세요."
    ];
    
    return messages[breakCount] || "잠시 휴식을 취해보세요.";
  }

  // 팁 생성
  generateTips(dayStep, day) {
    const tips = {
      '월': "새로운 주의 시작이니 너무 부담스럽지 않게 가볍게 시작해보세요.",
      '화': "어제의 기운을 이어받아 꾸준히 진행해보세요.",
      '수': "중간점검의 날이니 지금까지의 성과를 확인해보세요.",
      '목': "마무리를 향해 달려가는 중이니 집중력을 유지해보세요.",
      '금': "이번 주의 마지막 학습일이니 성과를 만들어보세요.",
      '토': "주말에도 꾸준히 하면 더 큰 성과를 얻을 수 있어요.",
      '일': "일주일을 마무리하는 날이니 다음 주를 준비해보세요."
    };
    
    return tips[day] || "차근차근 진행하면 목표에 도달할 수 있어요!";
  }

  // 시간 포맷팅 (9 -> "09:00", 14.5 -> "14:30")
  formatTime(hour) {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // MCP 형식 일정표를 HTML로 렌더링
  renderMCPScheduleHTML(weeklySchedule) {
    let html = `
      <div class="scheduler-container">
        <div class="scheduler-header">
          <h2>📅 ${weeklySchedule.weekNumber}주차 일일 스케줄</h2>
          <div class="goal-info">
            <h3>🎯 목표: ${weeklySchedule.goal}</h3>
            <p>📅 기간: ${weeklySchedule.duration}</p>
            <div class="objectives">
              <h4>📋 주간 목표:</h4>
              <ul>
                ${weeklySchedule.objectives.map(obj => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
    `;

    Object.entries(weeklySchedule.dailySchedules).forEach(([day, schedule]) => {
      html += this.renderMCPDayScheduleHTML(day, schedule);
    });

    html += '</div>';
    return html;
  }

  // MCP 하루 일정 HTML 렌더링
  renderMCPDayScheduleHTML(day, schedule) {
    let html = `
      <div class="day-schedule">
        <div class="day-header">
          <h3>✅ ${schedule.day}요일 (${schedule.dayNumber}일차)</h3>
          <p class="day-title">${schedule.title}</p>
          <p class="day-goal"><strong>목표:</strong> ${schedule.goal}</p>
          <p class="day-motivation">💪 ${schedule.motivation}</p>
        </div>
        
        <div class="schedule-timeline">
    `;

    // 활동들 렌더링
    schedule.activities.forEach((activity, index) => {
      html += `
        <div class="activity-item" data-type="${activity.type}">
          <div class="activity-time">${activity.time}</div>
          <div class="activity-content">
            <h4>${activity.title}</h4>
            <p>${activity.friendlyDescription}</p>
            <span class="activity-duration">⏱ ${activity.duration}시간</span>
          </div>
        </div>
      `;

      // 쉬는 시간 추가 (활동 사이에)
      if (schedule.breaks[index]) {
        const breakItem = schedule.breaks[index];
        html += `
          <div class="break-item">
            <div class="break-time">${breakItem.time}</div>
            <div class="break-content">
              <p>☕ ${breakItem.friendlyDescription}</p>
            </div>
          </div>
        `;
      }
    });

    html += `
        </div>
        
        <div class="day-tips">
          <h4>💡 오늘의 팁</h4>
          <p>${schedule.tips}</p>
        </div>
      </div>
    `;

    return html;
  }
}

// 전역 객체로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchedulerAgent;
} else {
  window.SchedulerAgent = SchedulerAgent;
}
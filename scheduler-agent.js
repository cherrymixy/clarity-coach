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

  // 기존 Strategy Agent의 전략을 받아서 일일 일정표 생성 (구글 캘린더 파싱용)
  generateDailySchedule(strategyData, weekNumber, customSettings = {}) {
    const {
      strategyType,
      strategyTitle,
      strategyDescription,
      dailyTasks
    } = strategyData;

    // 사용자 설정 적용
    if (customSettings.availableHours) {
      this.availableHours = customSettings.availableHours;
    }
    if (customSettings.dailyStudyTime) {
      this.dailyStudyTime = customSettings.dailyStudyTime;
    }

    const weeklySchedule = {
      weekNumber: weekNumber,
      strategyType: strategyType,
      strategyTitle: strategyTitle,
      strategyDescription: strategyDescription,
      dailySchedules: {}
    };

    // 월~금요일 일정 생성
    const weekdays = ['월', '화', '수', '목', '금'];
    
    weekdays.forEach((day, index) => {
      const dayNumber = index + 1;
      const dailyTask = dailyTasks[dayNumber - 1] || dailyTasks[0]; // 기본값 처리
      
      weeklySchedule.dailySchedules[day] = this.createDaySchedule(
        day, 
        dayNumber, 
        dailyTask, 
        strategyType
      );
    });

    return weeklySchedule;
  }

  // 기존 하루 일정 생성 (구글 캘린더 파싱용)
  createDaySchedule(day, dayNumber, dailyTask, strategyType) {
    const schedule = {
      day: day,
      dayNumber: dayNumber,
      title: dailyTask.title,
      goal: dailyTask.details.목표,
      estimatedTime: dailyTask.details.예상시간,
      activities: [],
      breaks: [],
      feedback: dailyTask.details.피드백
    };

    // 전략 타입에 따른 활동 배치
    const activities = this.generateActivities(dailyTask, strategyType);
    
    // 시간대별로 활동 배치
    let currentTime = this.availableHours.start;
    let activityIndex = 0;
    let breakCount = 0;

    while (currentTime < this.availableHours.end && activityIndex < activities.length) {
      const activity = activities[activityIndex];
      
      // 활동 시간 계산
      const activityDuration = this.calculateActivityDuration(activity, strategyType);
      
      // 활동 추가
      schedule.activities.push({
        time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + activityDuration)}`,
        title: activity.title,
        description: activity.description,
        duration: activityDuration,
        type: activity.type
      });

      currentTime += activityDuration;
      activityIndex++;

      // 쉬는 시간 추가 (2시간마다 또는 활동 후)
      if (breakCount < 2 && currentTime < this.availableHours.end - 1) {
        const breakDuration = 0.5; // 30분
        schedule.breaks.push({
          time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + breakDuration)}`,
          description: "휴식 및 정리 시간",
          duration: breakDuration
        });
        currentTime += breakDuration;
        breakCount++;
      }
    }

    return schedule;
  }

  // 기존 전략 타입에 따른 활동 생성 (구글 캘린더 파싱용)
  generateActivities(dailyTask, strategyType) {
    const activities = [];

    switch (strategyType) {
      case '체계적 계획형':
        activities.push(
          {
            title: "목표 분석 및 계획 수립",
            description: dailyTask.details.목표,
            type: "planning"
          },
          {
            title: "학습 자료 준비",
            description: dailyTask.details.방법,
            type: "preparation"
          },
          {
            title: "실습 및 적용",
            description: "계획에 따른 실제 학습 진행",
            type: "practice"
          }
        );
        break;

      case '실습 중심 몰입형':
        activities.push(
          {
            title: "즉시 실습 시작",
            description: dailyTask.details.목표,
            type: "practice"
          },
          {
            title: "실습 중 피드백 수집",
            description: dailyTask.details.방법,
            type: "feedback"
          },
          {
            title: "개선점 적용 및 재실습",
            description: "발견한 개선점을 바탕으로 재도전",
            type: "improvement"
          }
        );
        break;

      case '감각적 체험형':
        activities.push(
          {
            title: "감각적 자료 탐색",
            description: dailyTask.details.목표,
            type: "exploration"
          },
          {
            title: "감각적 학습 환경 조성",
            description: dailyTask.details.방법,
            type: "environment"
          },
          {
            title: "감각적 피드백 관찰",
            description: "학습 중 느끼는 감각적 신호 분석",
            type: "sensory"
          }
        );
        break;

      default:
        activities.push(
          {
            title: dailyTask.title,
            description: dailyTask.details.목표,
            type: "general"
          }
        );
    }

    return activities;
  }

  // 기존 활동별 시간 계산 (구글 캘린더 파싱용)
  calculateActivityDuration(activity, strategyType) {
    const baseDuration = 1; // 기본 1시간

    switch (activity.type) {
      case 'planning':
        return strategyType === '체계적 계획형' ? 1.5 : 1;
      case 'preparation':
        return 1;
      case 'practice':
        return strategyType === '실습 중심 몰입형' ? 1.5 : 1;
      case 'feedback':
        return 0.5;
      case 'improvement':
        return 1;
      case 'exploration':
        return strategyType === '감각적 체험형' ? 1.5 : 1;
      case 'environment':
        return 0.5;
      case 'sensory':
        return 1;
      default:
        return baseDuration;
    }
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
      tips: this.generateTips(dayStep, day),
      timeSchedule: [] // 시간별 스케줄 추가
    };

    // 활동 분해 및 시간 배치
    const activities = this.decomposeActivity(dayStep, day);
    
    // 시간대별로 활동 배치
    let currentTime = this.availableHours.start;
    let activityIndex = 0;
    let breakCount = 0;
    let timeScheduleIndex = 0;

    while (currentTime < this.availableHours.end && activityIndex < activities.length) {
      const activity = activities[activityIndex];
      
      // 활동 시간 계산
      const activityDuration = this.calculateMCPActivityDuration(activity, day);
      
      // 활동 추가
      schedule.activities.push({
        time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + activityDuration)}`,
        title: activity.title,
        description: activity.description,
        duration: activityDuration,
        type: activity.type,
        friendlyDescription: this.makeFriendlyDescription(activity, day)
      });

      // 시간별 스케줄에 추가 (지정된 형식)
      const startTime = this.formatTimeForSchedule(currentTime);
      const endTime = this.formatTimeForSchedule(currentTime + activityDuration);
      const durationMinutes = Math.round(activityDuration * 60);
      
      schedule.timeSchedule.push({
        format1: `[${startTime}] ${activity.title} (${durationMinutes}분)`,
        format2: `${this.getTimePeriod(currentTime)} ${startTime}~${endTime}: ${activity.title}`,
        activity: activity
      });

      currentTime += activityDuration;
      activityIndex++;
      timeScheduleIndex++;

      // 쉬는 시간 추가 (2시간마다 또는 활동 후)
      if (breakCount < 2 && currentTime < this.availableHours.end - 1) {
        const breakDuration = 0.5; // 30분
        schedule.breaks.push({
          time: `${this.formatTime(currentTime)}~${this.formatTime(currentTime + breakDuration)}`,
          description: "휴식 및 정리 시간",
          duration: breakDuration,
          friendlyDescription: this.generateBreakMessage(day, breakCount)
        });

        // 쉬는 시간도 시간별 스케줄에 추가
        const breakStartTime = this.formatTimeForSchedule(currentTime);
        const breakEndTime = this.formatTimeForSchedule(currentTime + breakDuration);
        
        schedule.timeSchedule.push({
          format1: `[${breakStartTime}] 휴식 (30분)`,
          format2: `${this.getTimePeriod(currentTime)} ${breakStartTime}~${breakEndTime}: 휴식`,
          activity: { title: "휴식", type: "break" }
        });

        currentTime += breakDuration;
        breakCount++;
        timeScheduleIndex++;
      }
    }

    return schedule;
  }

  // 시간 형식 변환 (HH:MM)
  formatTimeForSchedule(hour) {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 시간대 구분 (오전/오후/저녁)
  getTimePeriod(hour) {
    if (hour < 12) return "오전";
    if (hour < 18) return "오후";
    return "저녁";
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

  // MCP 활동별 시간 계산
  calculateMCPActivityDuration(activity, day) {
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

  // 기존 형식 일정표를 HTML로 렌더링 (구글 캘린더 파싱용)
  renderScheduleHTML(weeklySchedule) {
    let html = `
      <div class="scheduler-container">
        <div class="scheduler-header">
          <h2>📅 ${weeklySchedule.weekNumber}주차 일일 일정표</h2>
          <div class="strategy-info">
            <h3>${weeklySchedule.strategyTitle || '주간 전략'}</h3>
            <p>${weeklySchedule.strategyDescription || weeklySchedule.goal}</p>
          </div>
        </div>
    `;

    Object.entries(weeklySchedule.dailySchedules).forEach(([day, schedule]) => {
      html += this.renderDayScheduleHTML(day, schedule);
    });

    html += '</div>';
    return html;
  }

  // 기존 하루 일정 HTML 렌더링 (구글 캘린더 파싱용)
  renderDayScheduleHTML(day, schedule) {
    let html = `
      <div class="day-schedule">
        <div class="day-header">
          <h3>✅ ${schedule.day}요일 (${schedule.dayNumber}일차)</h3>
          <p class="day-goal"><strong>목표:</strong> ${schedule.goal}</p>
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
            <p>${activity.description}</p>
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
              <p>☕ ${breakItem.description}</p>
            </div>
          </div>
        `;
      }
    });

    html += `
        </div>
        
        <div class="day-feedback">
          <h4>💡 하루 마무리 피드백</h4>
          <p>${schedule.feedback || '오늘 하루도 수고하셨습니다!'}</p>
        </div>
      </div>
    `;

    return html;
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
    // 요일별 제목 생성
    const dayTitle = this.generateDayTitle(schedule.day, schedule.dayNumber, schedule.goal);
    
    let html = `
      <div class="day-schedule">
        <div class="day-header">
          <h3>⏰ ${dayTitle}</h3>
          <p class="day-title">${schedule.title}</p>
          <p class="day-goal"><strong>목표:</strong> ${schedule.goal}</p>
          <p class="day-motivation">💪 ${schedule.motivation}</p>
        </div>
        
        <div class="schedule-timeline">
    `;

    // 시간별 스케줄 렌더링 (구글 캘린더 파싱용 형식만)
    html += `
      <div class="time-schedule-section">
        <h4>📅 캘린더 등록용 스케줄</h4>
        <div class="time-schedule-list">
    `;

    schedule.timeSchedule.forEach((timeItem, index) => {
      if (timeItem.activity.type === 'break') {
        // 휴식은 제외하고 활동만 출력
        return;
      }
      
      // 시간과 제목 추출
      const timeMatch = timeItem.format1.match(/\[(\d{2}:\d{2})\]/);
      const titleMatch = timeItem.format1.match(/\]\s*(.+?)\s*\(/);
      const durationMatch = timeItem.format1.match(/\((\d+)분\)/);
      
      if (timeMatch && titleMatch && durationMatch) {
        const time = timeMatch[1];
        const title = titleMatch[1];
        const duration = durationMatch[1];
        
        html += `
          <div class="time-activity-item">
            <div class="calendar-format">- [${time}] [${title}] (${duration}분)</div>
          </div>
        `;
      }
    });

    html += `
        </div>
      </div>
    `;

    // 상세 활동들 렌더링
    html += `
      <div class="detailed-activities">
        <h4>📋 상세 활동</h4>
    `;

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
        </div>
        
        <div class="day-tips">
          <h4>💡 오늘의 팁</h4>
          <p>${schedule.tips}</p>
        </div>
      </div>
    `;

    return html;
  }

  // 시간별 스케줄만 텍스트로 출력 (구글 캘린더 파싱용 형식)
  generateTimeScheduleText(weeklySchedule, format = 1) {
    let text = `=== ${weeklySchedule.weekNumber}주차 시간별 스케줄 ===\n`;
    text += `목표: ${weeklySchedule.goal}\n`;
    text += `기간: ${weeklySchedule.duration}\n\n`;

    Object.entries(weeklySchedule.dailySchedules).forEach(([day, schedule]) => {
      // 요일별 제목 생성
      const dayTitle = this.generateDayTitle(schedule.day, schedule.dayNumber, schedule.goal);
      text += `⏰ ${dayTitle}\n`;
      
      // 시간별 스케줄 출력 (구글 캘린더 파싱 형식)
      schedule.timeSchedule.forEach((timeItem) => {
        if (timeItem.activity.type === 'break') {
          // 휴식은 제외하고 활동만 출력
          return;
        }
        
        // 시간과 제목 추출
        const timeMatch = timeItem.format1.match(/\[(\d{2}:\d{2})\]/);
        const titleMatch = timeItem.format1.match(/\]\s*(.+?)\s*\(/);
        const durationMatch = timeItem.format1.match(/\((\d+)분\)/);
        
        if (timeMatch && titleMatch && durationMatch) {
          const time = timeMatch[1];
          const title = titleMatch[1];
          const duration = durationMatch[1];
          
          text += `- [${time}] [${title}] (${duration}분)\n`;
        }
      });
      
      text += '\n';
    });

    return text;
  }

  // 요일별 제목 생성
  generateDayTitle(day, dayNumber, goal) {
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
    
    // 요일별 특성에 맞는 제목 생성
    switch (day) {
      case '월':
        return `${dayName} - 주간 시작`;
      case '화':
        return `${dayName} - 꾸준한 진행`;
      case '수':
        return `${dayName} - 중간점검`;
      case '목':
        return `${dayName} - 마무리 준비`;
      case '금':
        return `${dayName} - 주간 마무리`;
      case '토':
        return `${dayName} - 주말 학습`;
      case '일':
        return `${dayName} - 주간 마무리`;
      default:
        return `${dayName} - ${goal}`;
    }
  }
}

// 전역 객체로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchedulerAgent;
} else {
  window.SchedulerAgent = SchedulerAgent;
}
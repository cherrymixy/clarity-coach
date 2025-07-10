// Scheduler Agent - 일일 일정 코치
// Strategy Agent의 주간 실행 전략을 받아서 상세한 일일 일정표로 변환

class SchedulerAgent {
  constructor() {
    this.availableHours = {
      start: 9, // 오전 9시
      end: 18   // 오후 6시
    };
    this.dailyStudyTime = 3; // 하루 3시간 학습 (기본값)
    this.breakTime = 30; // 쉬는 시간 30분
  }

  // Strategy Agent의 전략을 받아서 일일 일정표 생성
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

  // 하루 일정 생성
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

  // 전략 타입에 따른 활동 생성
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

  // 활동별 시간 계산
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

  // 시간 포맷팅 (9 -> "09:00", 14.5 -> "14:30")
  formatTime(hour) {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 일정표를 HTML로 렌더링
  renderScheduleHTML(weeklySchedule) {
    let html = `
      <div class="scheduler-container">
        <div class="scheduler-header">
          <h2>📅 ${weeklySchedule.weekNumber}주차 일일 일정표</h2>
          <div class="strategy-info">
            <h3>${weeklySchedule.strategyTitle}</h3>
            <p>${weeklySchedule.strategyDescription}</p>
          </div>
        </div>
    `;

    Object.entries(weeklySchedule.dailySchedules).forEach(([day, schedule]) => {
      html += this.renderDayScheduleHTML(day, schedule);
    });

    html += '</div>';
    return html;
  }

  // 하루 일정 HTML 렌더링
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
          <p>${schedule.feedback}</p>
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
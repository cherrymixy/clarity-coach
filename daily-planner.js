class DailyPlannerCoach {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.setDefaultTimes();
  }

  initializeElements() {
    this.tasksInput = document.getElementById('tasks-input');
    this.startTimeInput = document.getElementById('start-time');
    this.endTimeInput = document.getElementById('end-time');
    this.constraintsInput = document.getElementById('constraints-input');
    this.planBtn = document.getElementById('plan-btn');
    this.loading = document.getElementById('loading');
    this.resultSection = document.getElementById('result-section');
    this.planResult = document.getElementById('plan-result');
    this.regenerateBtn = document.getElementById('regenerate-btn');
    this.saveBtn = document.getElementById('save-btn');
  }

  bindEvents() {
    this.planBtn.addEventListener('click', () => this.generatePlan());
    this.regenerateBtn.addEventListener('click', () => this.generatePlan());
    this.saveBtn.addEventListener('click', () => this.savePlan());
    
    // 엔터키로 계획 생성
    this.tasksInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.generatePlan();
      }
    });
  }

  setDefaultTimes() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 현재 시간을 기준으로 적절한 시작 시간 설정
    if (currentHour < 9) {
      this.startTimeInput.value = '09:00';
    } else {
      this.startTimeInput.value = `${String(currentHour + 1).padStart(2, '0')}:00`;
    }
  }

  async generatePlan() {
    const tasks = this.tasksInput.value.trim();
    const startTime = this.startTimeInput.value;
    const endTime = this.endTimeInput.value;
    const constraints = this.constraintsInput.value.trim();

    if (!tasks) {
      this.showError('할 일을 입력해 주세요! 😊');
      return;
    }

    this.showLoading();

    try {
      const plan = await this.callPlannerAPI(tasks, startTime, endTime, constraints);
      this.displayPlan(plan);
    } catch (error) {
      console.error('계획 생성 오류:', error);
      this.showError('앗! 계획을 세우는 중에 문제가 생겼어요. 다시 시도해주세요. 🤔');
    }
  }

  async callPlannerAPI(tasks, startTime, endTime, constraints) {
    const prompt = this.createPlannerPrompt(tasks, startTime, endTime, constraints);

    const response = await fetch('/api/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `너는 친절하고 현실적인 "하루 계획 코치"야. 사용자의 할 일과 시간을 분석해서 효율적이고 실현 가능한 일정을 만들어 줘.

응답 형식:
1. 친근한 코치 메시지 (1-2줄)
2. JSON 형태의 일정표:
{
  "message": "친근한 조언 메시지",
  "statistics": {
    "totalTasks": 5,
    "workTime": "6시간",
    "breakTime": "2시간"
  },
  "schedule": [
    {
      "time": "09:00",
      "duration": "1시간",
      "title": "작업 제목",
      "description": "간단한 설명과 팁",
      "type": "work|break|meal|exercise"
    }
  ]
}

규칙:
- 현실적인 시간 배분 (집중시간 최대 2시간)
- 적절한 휴식 시간 포함
- 식사 시간 고려
- 우선순위 기반 일정 배치
- 친근하고 격려하는 말투 사용`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    return this.parsePlanResponse(data.choices[0].message.content);
  }

  createPlannerPrompt(tasks, startTime, endTime, constraints) {
    const currentDate = new Date().toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
오늘 날짜: ${currentDate}
시간: ${startTime} ~ ${endTime}

해야 할 일들:
${tasks}

추가 상황/제약사항:
${constraints || '특별한 제약사항 없음'}

위 정보를 바탕으로 현실적이고 효율적인 하루 일정을 짜 주세요.
집중 시간, 휴식, 식사 등을 모두 고려해서 타임라인 형태로 만들어 주세요.
`;
  }

  parsePlanResponse(response) {
    try {
      // GPT 응답에서 JSON 부분 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // JSON이 없다면 응답을 파싱해서 기본 구조 생성
        return this.createFallbackPlan(response);
      }
    } catch (error) {
      console.error('응답 파싱 오류:', error);
      return this.createFallbackPlan(response);
    }
  }

  createFallbackPlan(response) {
    return {
      message: "좋아! 오늘 하루 계획을 세워봤어. 차근차근 해보자! 💪",
      statistics: {
        totalTasks: 3,
        workTime: "4시간",
        breakTime: "1시간"
      },
      schedule: [
        {
          time: this.startTimeInput.value,
          duration: "30분",
          title: "하루 시작 준비",
          description: "계획 점검하고 마음 다잡기",
          type: "preparation"
        }
      ],
      rawResponse: response
    };
  }

  displayPlan(plan) {
    this.hideLoading();
    this.showResult();

    let html = '';

    // 코치 메시지
    if (plan.message) {
      html += `<div class="coach-message">${plan.message}</div>`;
    }

    // 통계 정보
    if (plan.statistics) {
      html += `
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-number">${plan.statistics.totalTasks || 0}</div>
            <div class="stat-label">할 일</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${plan.statistics.workTime || '0시간'}</div>
            <div class="stat-label">작업 시간</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${plan.statistics.breakTime || '0시간'}</div>
            <div class="stat-label">휴식 시간</div>
          </div>
        </div>
      `;
    }

    // 일정표
    if (plan.schedule && plan.schedule.length > 0) {
      html += '<div class="timeline">';
      plan.schedule.forEach(item => {
        const typeIcon = this.getTypeIcon(item.type);
        html += `
          <div class="timeline-item">
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-content">
              <div class="timeline-title">${typeIcon} ${item.title}</div>
              ${item.description ? `<div class="timeline-description">${item.description}</div>` : ''}
              ${item.duration ? `<div class="timeline-description"><strong>예상 소요: ${item.duration}</strong></div>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    // 원본 응답이 있다면 표시 (디버깅용)
    if (plan.rawResponse && plan.schedule.length <= 1) {
      html += `<div style="background: #f8f9fa; padding: 16px; border-radius: 12px; white-space: pre-line; font-size: 0.9rem; line-height: 1.6;">${plan.rawResponse}</div>`;
    }

    this.planResult.innerHTML = html;
  }

  getTypeIcon(type) {
    const icons = {
      work: '💼',
      break: '☕',
      meal: '🍽️',
      exercise: '💪',
      study: '📚',
      personal: '✨',
      preparation: '🎯',
      default: '📝'
    };
    return icons[type] || icons.default;
  }

  showLoading() {
    this.loading.classList.remove('hidden');
    this.resultSection.classList.add('hidden');
    this.planBtn.disabled = true;
    this.planBtn.textContent = '계획 세우는 중...';
  }

  hideLoading() {
    this.loading.classList.add('hidden');
    this.planBtn.disabled = false;
    this.planBtn.textContent = '📋 하루 일정 짜기';
  }

  showResult() {
    this.resultSection.classList.remove('hidden');
  }

  showError(message) {
    this.hideLoading();
    this.planResult.innerHTML = `<div style="text-align: center; color: #d00; padding: 20px;">${message}</div>`;
    this.showResult();
  }

  savePlan() {
    const planContent = this.planResult.innerHTML;
    localStorage.setItem('dailyPlan', planContent);
    localStorage.setItem('dailyPlanDate', new Date().toISOString());
    
    // 성공 메시지 표시
    const originalText = this.saveBtn.textContent;
    this.saveBtn.textContent = '✅ 저장 완료!';
    this.saveBtn.style.background = '#28a745';
    
    setTimeout(() => {
      this.saveBtn.textContent = originalText;
      this.saveBtn.style.background = '#007aff';
    }, 2000);
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new DailyPlannerCoach();
});
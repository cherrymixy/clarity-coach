// 하루 계획 코치 - Planner Agent
class PlannerAgent {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.taskInput = document.getElementById('task-input');
    this.availableTime = document.getElementById('available-time');
    this.planBtn = document.getElementById('plan-btn');
    this.loading = document.getElementById('loading');
    this.resultBox = document.getElementById('result-box');
    this.scheduleOutput = document.getElementById('schedule-output');
    this.newPlanBtn = document.getElementById('new-plan-btn');
  }

  bindEvents() {
    this.planBtn.addEventListener('click', () => this.generatePlan());
    this.newPlanBtn.addEventListener('click', () => this.resetForm());
  }

  async generatePlan() {
    const tasks = this.taskInput.value.trim();
    const availableHours = this.availableTime.value;

    if (!tasks) {
      this.showError('할 일을 입력해주세요!');
      return;
    }

    this.showLoading();

    try {
      const plan = await this.createDailyPlan(tasks, availableHours);
      this.displayPlan(plan);
    } catch (error) {
      console.error('계획 생성 오류:', error);
      this.showError('계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  async createDailyPlan(tasks, availableHours) {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    const prompt = `🎯 역할: 너는 "하루 계획 코치" 역할을 맡은 Planner Agent야.
사용자의 현재 상태, 할 일, 시간 제약 등을 바탕으로 현실적이고 효과적인 하루 일정을 설계해 줘.

사용자 입력:
- 할 일: ${tasks}
- 사용 가능한 시간: ${availableHours}시간
- 현재 시간: ${currentHour}시

요구사항:
1. 우선순위를 자동으로 정리해
2. 집중 시간, 휴식 시간, 식사 시간 등도 고려해서 일정표를 구성해
3. 타임라인 형식으로 보여 줘 (예: 10:00~11:00 UX 과제)
4. 친절하지만 간결하게, 친구처럼 다정하되 현실적인 조언을 해
5. 시간이 부족한 경우 우선순위를 제안해

응답 형식:
"좋아! 오늘은 꽤 바쁘네. 이렇게 짜보는 건 어때?

📅 오늘의 계획표
[시간별 일정을 여기에 작성]

💡 팁: [현실적인 조언]"

현재 시간을 기준으로 현실적인 계획을 만들어줘.`;

    const response = await fetch('/api/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('API 호출 실패');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  displayPlan(plan) {
    this.hideLoading();
    this.scheduleOutput.innerHTML = plan.replace(/\n/g, '<br>');
    this.resultBox.classList.remove('hidden');
  }

  showLoading() {
    this.loading.classList.remove('hidden');
    this.resultBox.classList.add('hidden');
  }

  hideLoading() {
    this.loading.classList.add('hidden');
  }

  showError(message) {
    this.hideLoading();
    this.scheduleOutput.innerHTML = `<div class="error">❌ ${message}</div>`;
    this.resultBox.classList.remove('hidden');
  }

  resetForm() {
    this.taskInput.value = '';
    this.availableTime.value = '4';
    this.resultBox.classList.add('hidden');
    this.taskInput.focus();
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PlannerAgent();
});
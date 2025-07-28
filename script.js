const btn = document.getElementById('generate-btn');
const input = document.getElementById('goal-input');
const resultBox = document.getElementById('result-box');

btn.addEventListener('click', async () => {
  const goal = input.value.trim();
  if (!goal) {
    resultBox.innerHTML = '<span style="color:#d00">목표를 입력해 주세요.</span>';
    return;
  }
  // 목표를 localStorage에 저장
  localStorage.setItem('user_goal', goal);
  // 학습 프로세스 페이지로 이동
  window.location.href = 'process.html';
});

// 일정표로 바로 이동하는 함수
function goToScheduler() {
  const goal = input.value.trim();
  if (!goal) {
    resultBox.innerHTML = '<span style="color:#d00">목표를 먼저 입력해 주세요.</span>';
    return;
  }
  // 목표를 localStorage에 저장
  localStorage.setItem('user_goal', goal);
  // 기본 전략 설정 (사용자가 전략을 선택하지 않은 경우)
  if (!localStorage.getItem('selected_strategy')) {
    localStorage.setItem('selected_strategy', '체계적 계획형');
  }
  // 일정표 페이지로 이동
  window.location.href = 'scheduler.html';
}

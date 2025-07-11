// MCP 형식 Scheduler Agent 테스트 스크립트

// Scheduler Agent 로드
const SchedulerAgent = require('./scheduler-agent.js');

// 테스트용 MCP 데이터
const testMCPData = {
  "goal": "영어 프레젠테이션 능력 향상",
  "duration": "4주",
  "weekly_plan": {
    "week": 1,
    "objectives": ["Impressionism 주제 발표 자료 준비", "Abstract Art 주제 말하기 연습"],
    "steps": {
      "Mon": "Impressionism에 대한 연구 및 자료 수집",
      "Tue": "Impressionism 주제 발표 자료 작성",
      "Wed": "수정 사항 반영",
      "Thu": "Abstract Art 자료 조사",
      "Fri": "Abstract Art 발표 자료 정리",
      "Sat": "말하기 연습 및 녹음",
      "Sun": "자기 평가 및 피드백 요청"
    }
  }
};

// 사용자 설정
const customSettings = {
  availableHours: {
    start: 9,  // 오전 9시
    end: 18    // 오후 6시
  },
  dailyStudyTime: 3  // 하루 3시간
};

// Scheduler Agent 인스턴스 생성
const scheduler = new SchedulerAgent();

console.log('🚀 MCP 형식 Scheduler Agent 테스트 시작\n');

// 1. MCP 데이터로 스케줄 생성
console.log('📅 1. MCP 데이터로 주간 스케줄 생성...');
const weeklySchedule = scheduler.generateDailyScheduleFromMCP(testMCPData, customSettings);

console.log(`✅ ${weeklySchedule.weekNumber}주차 스케줄 생성 완료`);
console.log(`🎯 목표: ${weeklySchedule.goal}`);
console.log(`📅 기간: ${weeklySchedule.duration}`);
console.log(`📋 주간 목표: ${weeklySchedule.objectives.join(', ')}\n`);

// 2. 각 요일별 시간별 스케줄 출력
console.log('⏰ 2. 요일별 시간별 스케줄 (형식 1):');
console.log('='.repeat(60));

Object.entries(weeklySchedule.dailySchedules).forEach(([day, schedule]) => {
  console.log(`\n[${schedule.day}요일]`);
  console.log(`제목: ${schedule.title}`);
  console.log(`목표: ${schedule.goal}`);
  console.log(`동기부여: ${schedule.motivation}`);
  
  console.log('\n시간별 스케줄:');
  schedule.timeSchedule.forEach((timeItem) => {
    console.log(`  ${timeItem.format1}`);
  });
  
  console.log(`\n팁: ${schedule.tips}`);
  console.log('-'.repeat(40));
});

// 3. 형식 2로 텍스트 출력
console.log('\n⏰ 3. 전체 주간 스케줄 (형식 2):');
console.log('='.repeat(60));
const textSchedule2 = scheduler.generateTimeScheduleText(weeklySchedule, 2);
console.log(textSchedule2);

// 4. 형식 1로 텍스트 출력
console.log('\n⏰ 4. 전체 주간 스케줄 (형식 1):');
console.log('='.repeat(60));
const textSchedule1 = scheduler.generateTimeScheduleText(weeklySchedule, 1);
console.log(textSchedule1);

// 5. HTML 렌더링 테스트
console.log('\n🌐 5. HTML 렌더링 테스트...');
const htmlOutput = scheduler.renderMCPScheduleHTML(weeklySchedule);
console.log('✅ HTML 렌더링 완료 (길이:', htmlOutput.length, '문자)');

// 6. 통계 정보
console.log('\n📊 6. 생성된 스케줄 통계:');
let totalActivities = 0;
let totalBreaks = 0;

Object.values(weeklySchedule.dailySchedules).forEach(schedule => {
  totalActivities += schedule.activities.length;
  totalBreaks += schedule.breaks.length;
});

console.log(`- 총 요일 수: ${Object.keys(weeklySchedule.dailySchedules).length}일`);
console.log(`- 총 활동 수: ${totalActivities}개`);
console.log(`- 총 휴식 수: ${totalBreaks}개`);
console.log(`- 평균 하루 활동: ${(totalActivities / Object.keys(weeklySchedule.dailySchedules).length).toFixed(1)}개`);

console.log('\n🎉 MCP 형식 Scheduler Agent 테스트 완료!');
console.log('\n💡 사용 방법:');
console.log('1. 브라우저에서 http://localhost:3000/scheduler 접속');
console.log('2. MCP 데이터 입력 또는 예시 데이터 사용');
console.log('3. "친근한 스케줄 생성하기" 버튼 클릭');
console.log('4. 시간별 스케줄과 텍스트 형식 확인');
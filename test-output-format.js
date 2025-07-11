const SchedulerAgent = require('./scheduler-agent.js');

console.log('🔍 구글 캘린더 파싱용 형식 테스트\n');

// MCP 테스트 데이터
const mcpData = {
  "goal": "논문 스터디 완료",
  "duration": "2주",
  "weekly_plan": {
    "week": 1,
    "objectives": ["논문 선정 및 계획 수립", "논문 읽기 및 요약"],
    "steps": {
      "Mon": "논문 선정 및 스터디 계획 수립",
      "Tue": "논문 읽기 및 요약 정리",
      "Wed": "논문 읽기 및 요약 정리",
      "Thu": "논문 읽기 및 요약 정리",
      "Fri": "논문 읽기 및 요약 정리",
      "Sat": "논문 읽기 및 요약 정리",
      "Sun": "주간 마무리 및 다음 주 계획"
    }
  }
};

// Scheduler Agent 생성
const schedulerAgent = new SchedulerAgent();

// 스케줄 생성
const weeklySchedule = schedulerAgent.generateDailyScheduleFromMCP(mcpData, {
  availableHours: { start: 8, end: 18 },
  dailyStudyTime: 4
});

// 구글 캘린더 파싱용 형식으로 출력
const calendarFormat = schedulerAgent.generateTimeScheduleText(weeklySchedule, 1);

console.log('📅 구글 캘린더 파싱용 형식:');
console.log('============================================================');
console.log(calendarFormat);
console.log('============================================================');

// 각 요일별로 파싱 가능한지 확인
console.log('\n🔍 파싱 테스트:');
const lines = calendarFormat.split('\n');
let currentDay = '';

lines.forEach((line, index) => {
  if (line.startsWith('⏰')) {
    currentDay = line.replace('⏰ ', '');
    console.log(`\n📅 ${currentDay}:`);
  } else if (line.startsWith('- [')) {
    // [08:00] [활동명] (60분) 형식 파싱
    const timeMatch = line.match(/\[(\d{2}:\d{2})\]/);
    const titleMatch = line.match(/\]\s*\[(.+?)\]\s*\(/);
    const durationMatch = line.match(/\((\d+)분\)/);
    
    if (timeMatch && titleMatch && durationMatch) {
      const time = timeMatch[1];
      const title = titleMatch[1];
      const duration = durationMatch[1];
      
      console.log(`  ✅ 시간: ${time}, 제목: ${title}, 지속시간: ${duration}분`);
    } else {
      console.log(`  ❌ 파싱 실패: ${line}`);
    }
  }
});

console.log('\n🎉 테스트 완료!');
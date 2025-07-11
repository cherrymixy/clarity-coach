const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class CreativeRoutineServer {
  constructor() {
    this.server = new Server(
      {
        name: 'creative-routine-designer',
        version: '1.0.0',
        description: '창의적 루틴 설계자 - 목표 달성을 위한 재미있고 창의적인 루틴을 설계하는 MCP 서버'
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  setupToolHandlers() {
    // 도구 목록 제공
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'design_creative_routine',
            description: '사용자의 목표, 관심사, 가능한 시간을 바탕으로 창의적인 루틴을 설계합니다.',
            inputSchema: {
              type: 'object',
              properties: {
                goal: {
                  type: 'string',
                  description: '달성하고 싶은 목표'
                },
                interests: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '사용자의 관심사 목록'
                },
                timeAvailable: {
                  type: 'string',
                  description: '하루에 실행 가능한 시간 (예: 30-60분)'
                },
                preferences: {
                  type: 'object',
                  properties: {
                    difficulty: {
                      type: 'string',
                      enum: ['beginner', 'intermediate', 'advanced'],
                      description: '난이도 수준'
                    },
                    style: {
                      type: 'string',
                      enum: ['structured', 'flexible', 'creative'],
                      description: '루틴 스타일'
                    }
                  }
                }
              },
              required: ['goal', 'interests', 'timeAvailable']
            }
          },
          {
            name: 'generate_weekly_challenge',
            description: '주간 챌린지를 생성합니다.',
            inputSchema: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  description: '챌린지 테마'
                },
                interests: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '관심사 목록'
                },
                duration: {
                  type: 'string',
                  description: '챌린지 기간'
                }
              },
              required: ['theme', 'interests']
            }
          },
          {
            name: 'create_motivation_booster',
            description: '동기부여 요소를 생성합니다.',
            inputSchema: {
              type: 'object',
              properties: {
                currentProgress: {
                  type: 'string',
                  description: '현재 진행 상황'
                },
                mood: {
                  type: 'string',
                  enum: ['motivated', 'neutral', 'discouraged'],
                  description: '현재 기분 상태'
                },
                interests: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '관심사 목록'
                }
              },
              required: ['currentProgress', 'mood', 'interests']
            }
          }
        ]
      };
    });

    // 도구 실행 핸들러
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'design_creative_routine':
          return await this.designCreativeRoutine(args);
        case 'generate_weekly_challenge':
          return await this.generateWeeklyChallenge(args);
        case 'create_motivation_booster':
          return await this.createMotivationBooster(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  setupResourceHandlers() {
    // 리소스 목록 제공
    this.server.setRequestHandler('resources/list', async () => {
      return {
        resources: [
          {
            uri: 'routine://templates/creative',
            name: '창의적 루틴 템플릿',
            description: '다양한 창의적 루틴 템플릿 모음',
            mimeType: 'application/json'
          },
          {
            uri: 'routine://challenges/weekly',
            name: '주간 챌린지 데이터베이스',
            description: '다양한 주간 챌린지 아이디어',
            mimeType: 'application/json'
          },
          {
            uri: 'routine://motivation/boosters',
            name: '동기부여 부스터',
            description: '동기부여를 위한 다양한 아이디어와 방법',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // 리소스 내용 제공
    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'routine://templates/creative':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.getCreativeTemplates())
            }]
          };
        case 'routine://challenges/weekly':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.getWeeklyChallenges())
            }]
          };
        case 'routine://motivation/boosters':
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.getMotivationBoosters())
            }]
          };
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  setupPromptHandlers() {
    // 프롬프트 목록 제공
    this.server.setRequestHandler('prompts/list', async () => {
      return {
        prompts: [
          {
            name: 'creative_routine_designer',
            description: '창의적 루틴 설계를 위한 시스템 프롬프트',
            arguments: [
              {
                name: 'goal',
                description: '사용자의 목표',
                required: true
              },
              {
                name: 'interests',
                description: '사용자의 관심사',
                required: true
              },
              {
                name: 'time_available',
                description: '가능한 시간',
                required: true
              }
            ]
          }
        ]
      };
    });

    // 프롬프트 내용 제공
    this.server.setRequestHandler('prompts/get', async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === 'creative_routine_designer') {
        return {
          description: '창의적 루틴 설계자 프롬프트',
          messages: [
            {
              role: 'system',
              content: {
                type: 'text',
                text: this.getCreativeRoutineSystemPrompt(args)
              }
            }
          ]
        };
      }
      
      throw new Error(`Unknown prompt: ${name}`);
    });
  }

  async designCreativeRoutine(args) {
    const { goal, interests, timeAvailable, preferences = {} } = args;
    
    const systemPrompt = this.getCreativeRoutineSystemPrompt({
      goal,
      interests: interests.join(', '),
      time_available: timeAvailable
    });

    const userPrompt = `
    사용자 정보:
    - 목표: ${goal}
    - 관심사: ${interests.join(', ')}
    - 가능한 시간: ${timeAvailable}
    - 선호 난이도: ${preferences.difficulty || 'intermediate'}
    - 선호 스타일: ${preferences.style || 'flexible'}

    위 정보를 바탕으로 창의적이고 재미있는 4주차 루틴을 설계해주세요.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2500,
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      
      return {
        content: [
          {
            type: 'text',
            text: content
          }
        ]
      };
    } catch (error) {
      throw new Error(`루틴 설계 실패: ${error.message}`);
    }
  }

  async generateWeeklyChallenge(args) {
    const { theme, interests, duration = '1주일' } = args;
    
    const prompt = `
    주간 챌린지 생성:
    - 테마: ${theme}
    - 관심사: ${interests.join(', ')}
    - 기간: ${duration}
    
    위 정보를 바탕으로 재미있고 도전적인 주간 챌린지를 생성해주세요.
    구체적인 활동, 달성 기준, 보상 시스템을 포함해주세요.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '너는 창의적인 챌린지 디자이너야. 사용자가 재미있게 참여할 수 있는 도전적이지만 달성 가능한 챌린지를 만들어줘.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.9
      });

      return {
        content: [
          {
            type: 'text',
            text: response.choices[0].message.content
          }
        ]
      };
    } catch (error) {
      throw new Error(`챌린지 생성 실패: ${error.message}`);
    }
  }

  async createMotivationBooster(args) {
    const { currentProgress, mood, interests } = args;
    
    const prompt = `
    동기부여 부스터 생성:
    - 현재 진행 상황: ${currentProgress}
    - 기분 상태: ${mood}
    - 관심사: ${interests.join(', ')}
    
    현재 상황에 맞는 동기부여 메시지와 실행 가능한 작은 행동을 제안해주세요.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: '너는 따뜻하고 격려적인 동기부여 코치야. 사용자의 현재 상황을 이해하고 맞춤형 격려와 실행 가능한 제안을 해줘.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      return {
        content: [
          {
            type: 'text',
            text: response.choices[0].message.content
          }
        ]
      };
    } catch (error) {
      throw new Error(`동기부여 부스터 생성 실패: ${error.message}`);
    }
  }

  getCreativeRoutineSystemPrompt(args) {
    return `
    🎯 역할: 너는 "창의적 루틴 설계자" 역할을 맡은 Strategy Agent야.
    목표를 달성하는 과정에서 사용자가 재미와 동기를 잃지 않도록 창의적이고 다채로운 방식으로 루틴을 제안해 줘.

    🎤 말투: 부담 없고 유쾌하게. 사용자에게 새로운 자극과 도전 의식을 줄 수 있도록 가볍지만 효과적인 루틴을 설계해 줘.

    📥 입력 정보:
    - 목표: ${args.goal}
    - 관심사/취향: ${args.interests}
    - 실행 가능 시간: ${args.time_available}

    📤 출력 형식 (반드시 이 JSON 형식으로 응답):
    {
      "weeklyThemes": [
        {
          "week": 1,
          "theme": "주차 제목",
          "description": "설명",
          "funElement": "재미 요소",
          "dailyActivities": ["활동1", "활동2", "활동3"]
        }
      ],
      "routineTypes": [
        {
          "type": "루틴 타입명",
          "description": "설명",
          "dailyStructure": "일일 구조 설명",
          "examples": ["예시1", "예시2"],
          "tips": ["팁1", "팁2"]
        }
      ],
      "challenges": [
        {
          "name": "챌린지명",
          "description": "설명",
          "duration": "기간",
          "reward": "보상",
          "difficulty": "난이도"
        }
      ],
      "motivationBoosters": [
        {
          "type": "부스터 타입",
          "description": "설명",
          "whenToUse": "언제 사용할지"
        }
      ]
    }

    🎨 창의적 요소 반드시 포함:
    - 사용자 관심사와 연결된 독특한 접근법
    - 랜덤 요소나 서프라이즈 미션
    - 진행 상황을 시각화하는 재미있는 방법
    - 소셜 요소나 커뮤니티 참여 방법
    - 성취감을 높이는 마일스톤 설정
    `;
  }

  getCreativeTemplates() {
    return {
      artistic: {
        name: '아티스틱 접근법',
        description: '예술적 요소를 활용한 창의적 루틴',
        activities: ['스케치북 활용', '컬러 코딩', '비주얼 저널링']
      },
      gamified: {
        name: '게이미피케이션 접근법',
        description: '게임 요소를 활용한 재미있는 루틴',
        activities: ['레벨업 시스템', '퀘스트 완료', '보상 획득']
      },
      social: {
        name: '소셜 접근법',
        description: '다른 사람과 함께하는 루틴',
        activities: ['스터디 그룹', '온라인 챌린지', '멘토링']
      }
    };
  }

  getWeeklyChallenges() {
    return {
      creativity: ['30일 창작 챌린지', '매일 새로운 아이디어 기록'],
      fitness: ['계단 오르기 챌린지', '매일 다른 운동 시도'],
      learning: ['새로운 단어 배우기', '매일 5분 독서'],
      mindfulness: ['감사 일기 쓰기', '명상 시간 늘리기']
    };
  }

  getMotivationBoosters() {
    return {
      quick: ['작은 성취 인정하기', '좋아하는 음악 듣기'],
      medium: ['진행 상황 시각화', '친구에게 공유하기'],
      intensive: ['목표 재설정', '새로운 접근법 시도']
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🎨 창의적 루틴 설계자 MCP 서버가 시작되었습니다!');
  }
}

// 서버 시작
if (require.main === module) {
  const server = new CreativeRoutineServer();
  server.start().catch(console.error);
}

module.exports = CreativeRoutineServer;
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "compressed-routine-strategist",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 압축 루틴 생성 툴
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_compressed_routine",
        description: "사용자의 목표, 주간 시간, 기간을 기반으로 최단 시간 내 핵심만 익히는 압축 루틴을 생성합니다.",
        inputSchema: {
          type: "object",
          properties: {
            goal: {
              type: "string",
              description: "달성하고자 하는 목표 (예: 영어로 미술사에 대해 말할 수 있게 되기)"
            },
            weeklyTime: {
              type: "number",
              description: "주간 실행 가능 시간 (분 단위)"
            },
            duration: {
              type: "number",
              description: "희망 기간 (주 단위)"
            }
          },
          required: ["goal", "weeklyTime", "duration"]
        }
      }
    ]
  };
});

// 툴 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_compressed_routine") {
    try {
      const { goal, weeklyTime, duration } = args;
      
      const systemPrompt = `당신은 "압축 루틴 전략가"입니다. 사용자가 달성하고자 하는 목표를 기반으로 최단 시간 내 핵심만 익히는 루틴을 제안해주세요.

🎯 역할: 
- 사용자의 목표를 분석하여 핵심만 추출
- 주어진 시간과 기간에 맞는 압축 학습 전략 제안
- 시간에 쫓기는 바쁜 사람도 바로 실천할 수 있도록 간결하고 직관적으로 제시

📥 입력 정보:
- 목표: ${goal}
- 주간 실행 가능 시간: ${Math.floor(weeklyTime / 60)}시간 ${weeklyTime % 60}분
- 희망 기간: ${duration}주

💡 핵심 원칙:
1. **압축 학습**: 핵심만 추출하여 최단 시간 내 달성
2. **실용성**: 바로 실천 가능한 구체적 행동
3. **효율성**: 시간 대비 최대 효과
4. **지속성**: 꾸준히 할 수 있는 루틴 설계

다음 형식으로 응답해주세요:

## 📅 주차별 집중 테마와 학습목표

### 1주차: [핵심 테마]
- **목표**: [구체적 목표]
- **핵심 활동**: [주요 활동 2-3개]
- **예상 시간**: [시간 배분]

### 2주차: [핵심 테마]
- **목표**: [구체적 목표]
- **핵심 활동**: [주요 활동 2-3개]
- **예상 시간**: [시간 배분]

[기간에 따라 계속...]

## ⏰ 핵심 실행 루틴

### 요일별 루틴
- **월-화**: [활동]
- **수-목**: [활동]
- **금-토**: [활동]
- **일**: [복습/정리]

### 세션별 구조
- **오전 세션** (XX분): [활동]
- **오후 세션** (XX분): [활동]
- **저녁 세션** (XX분): [활동]

## 💡 시간 절약 팁

1. **[팁 제목]**: [구체적 방법]
2. **[팁 제목]**: [구체적 방법]
3. **[팁 제목]**: [구체적 방법]

## 🎯 요약 피드백

[목표 달성을 위한 핵심 조언과 동기부여 메시지]`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `목표: ${goal}, 주간시간: ${weeklyTime}분, 기간: ${duration}주` }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;

      return {
        content: [
          {
            type: "text",
            text: content
          }
        ]
      };

    } catch (error) {
      console.error("MCP 서버 에러:", error);
      return {
        content: [
          {
            type: "text",
            text: `오류가 발생했습니다: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`알 수 없는 툴: ${name}`);
});

// MCP 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("MCP 압축 루틴 전략가 서버가 시작되었습니다.");
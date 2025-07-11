const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

class CreativeRoutineClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      // MCP 서버 프로세스 시작
      const serverProcess = spawn('node', ['mcp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // 표준 입출력을 통한 통신 설정
      this.transport = new StdioClientTransport({
        readable: serverProcess.stdout,
        writable: serverProcess.stdin
      });

      // 클라이언트 생성 및 연결
      this.client = new Client({
        name: 'creative-routine-web-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log('✅ MCP 클라이언트가 서버에 연결되었습니다.');

      // 에러 처리
      serverProcess.on('error', (error) => {
        console.error('❌ MCP 서버 프로세스 오류:', error);
        this.isConnected = false;
      });

      serverProcess.on('exit', (code) => {
        console.log(`🔄 MCP 서버 프로세스 종료 (코드: ${code})`);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ MCP 클라이언트 연결 실패:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.transport) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 MCP 클라이언트 연결이 종료되었습니다.');
    }
  }

  async listTools() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.listTools();
      return response.tools;
    } catch (error) {
      console.error('❌ 도구 목록 조회 실패:', error);
      throw error;
    }
  }

  async callTool(name, args) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.callTool({
        name,
        arguments: args
      });
      return response.content;
    } catch (error) {
      console.error(`❌ 도구 '${name}' 호출 실패:`, error);
      throw error;
    }
  }

  async listResources() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.listResources();
      return response.resources;
    } catch (error) {
      console.error('❌ 리소스 목록 조회 실패:', error);
      throw error;
    }
  }

  async readResource(uri) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.readResource({ uri });
      return response.contents;
    } catch (error) {
      console.error(`❌ 리소스 '${uri}' 읽기 실패:`, error);
      throw error;
    }
  }

  async listPrompts() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.listPrompts();
      return response.prompts;
    } catch (error) {
      console.error('❌ 프롬프트 목록 조회 실패:', error);
      throw error;
    }
  }

  async getPrompt(name, args) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const response = await this.client.getPrompt({
        name,
        arguments: args
      });
      return response;
    } catch (error) {
      console.error(`❌ 프롬프트 '${name}' 조회 실패:`, error);
      throw error;
    }
  }

  // 편의 메서드들
  async designCreativeRoutine(goal, interests, timeAvailable, preferences = {}) {
    return await this.callTool('design_creative_routine', {
      goal,
      interests,
      timeAvailable,
      preferences
    });
  }

  async generateWeeklyChallenge(theme, interests, duration = '1주일') {
    return await this.callTool('generate_weekly_challenge', {
      theme,
      interests,
      duration
    });
  }

  async createMotivationBooster(currentProgress, mood, interests) {
    return await this.callTool('create_motivation_booster', {
      currentProgress,
      mood,
      interests
    });
  }

  async getCreativeTemplates() {
    const contents = await this.readResource('routine://templates/creative');
    return JSON.parse(contents[0].text);
  }

  async getWeeklyChallenges() {
    const contents = await this.readResource('routine://challenges/weekly');
    return JSON.parse(contents[0].text);
  }

  async getMotivationBoosters() {
    const contents = await this.readResource('routine://motivation/boosters');
    return JSON.parse(contents[0].text);
  }
}

module.exports = CreativeRoutineClient;
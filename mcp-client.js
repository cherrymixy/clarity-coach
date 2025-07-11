import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPCompressedRoutineClient {
  constructor() {
    this.client = null;
    this.serverProcess = null;
  }

  async connect() {
    try {
      // MCP 서버 프로세스 시작
      this.serverProcess = spawn("node", ["mcp-server.js"], {
        cwd: __dirname,
        stdio: ["pipe", "pipe", "pipe"]
      });

      // MCP 클라이언트 생성
      const transport = new StdioClientTransport(
        this.serverProcess.stdin,
        this.serverProcess.stdout
      );

      this.client = new Client({
        name: "compressed-routine-client",
        version: "1.0.0",
      });

      await this.client.connect(transport);

      console.log("MCP 클라이언트가 연결되었습니다.");
      return true;
    } catch (error) {
      console.error("MCP 클라이언트 연결 실패:", error);
      return false;
    }
  }

  async generateCompressedRoutine(goal, weeklyTime, duration) {
    try {
      if (!this.client) {
        throw new Error("MCP 클라이언트가 연결되지 않았습니다.");
      }

      const result = await this.client.callTool({
        name: "generate_compressed_routine",
        arguments: {
          goal: goal,
          weeklyTime: weeklyTime,
          duration: duration
        }
      });

      return result.content[0].text;
    } catch (error) {
      console.error("압축 루틴 생성 실패:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

export default MCPCompressedRoutineClient;
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

export type BigDreamMessage = ChatCompletionMessageParam;

export interface BigDreamTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface BigDreamToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface BigDreamResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: BigDreamToolCall[];
    };
    finish_reason: string;
  }>;
}

export class BigDreamClient {
  private client: OpenAI;
  private currentModel: string = 'grok-3-latest';

  constructor(apiKey: string, model?: string, baseURL?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
      timeout: 360000,
    });
    if (model) {
      this.currentModel = model;
    }
  }

  setModel(model: string): void {
    this.currentModel = model;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  async chat(
    messages: BigDreamMessage[],
    tools?: BigDreamTool[],
    model?: string
  ): Promise<BigDreamResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: model || this.currentModel,
        messages,
        tools: tools || [],
        tool_choice: tools ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 4000,
      });

      return response as BigDreamResponse;
    } catch (error: any) {
      throw new Error(`BigDream API error: ${error.message}`);
    }
  }

  async *chatStream(
    messages: BigDreamMessage[],
    tools?: BigDreamTool[],
    model?: string
  ): AsyncGenerator<any, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: model || this.currentModel,
        messages,
        tools: tools || [],
        tool_choice: tools ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      throw new Error(`BigDream API error: ${error.message}`);
    }
  }
}
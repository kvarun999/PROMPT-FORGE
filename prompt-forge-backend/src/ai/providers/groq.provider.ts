import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { LlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class GroqProvider implements LlmProvider {
  private groq: Groq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async generateResponse(prompt: string, model: string) {
    const start = Date.now();
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
      });

      const end = Date.now();
      const output = completion.choices[0]?.message?.content || '';

      return {
        provider: 'groq',
        model: model,
        output: output,
        latencyMs: end - start,
        tokenUsage: completion.usage?.total_tokens || 0,
        cost: 0, // Groq beta is free
      };
    } catch (error) {
      throw new Error(`Groq Error: ${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider implements LlmProvider {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(prompt: string, model: string) {
    const start = Date.now();
    try {
      // Use the model passed from the frontend (e.g., 'gemini-1.5-flash')
      const aiModel = this.genAI.getGenerativeModel({ model: model });
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const end = Date.now();

      return {
        provider: 'gemini',
        model: model,
        output: text,
        latencyMs: end - start,
        tokenUsage: 0, // Gemini API doesn't always return token usage in the basic response
        cost: 0, // Free tier
      };
    } catch (error) {
      throw new Error(`Gemini Error: ${error.message}`);
    }
  }
}

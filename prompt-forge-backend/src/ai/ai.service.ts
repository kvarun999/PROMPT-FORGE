import { Injectable, BadRequestException } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';

@Injectable()
export class AiService {
  constructor(
    private geminiProvider: GeminiProvider,
    private groqProvider: GroqProvider,
  ) {}

  async generate(prompt: string, model: string, provider: string) {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return this.geminiProvider.generateResponse(prompt, model);
      case 'groq':
        return this.groqProvider.generateResponse(prompt, model);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }
}

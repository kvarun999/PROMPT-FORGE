import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('test')
  generateText(@Body() body: { prompt: string; model?: string }) {
    // Accept model here
    // Pass both arguments to the service.
    // If model is missing, pass undefined (the service will handle the default).
    return this.aiService.generateText(
      body.prompt,
      body.model || 'llama-3.3-70b-versatile',
    );
  }
}

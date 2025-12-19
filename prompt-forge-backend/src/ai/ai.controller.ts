import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate text using a specific provider and model',
  })
  @ApiBody({
    schema: {
      example: {
        prompt: 'Explain quantum physics',
        model: 'llama-3.3-70b-versatile',
        provider: 'groq',
      },
    },
  })
  async generate(
    @Body() body: { prompt: string; model: string; provider: string },
  ) {
    // Default to Groq if provider is missing for backward compatibility
    const provider = body.provider || 'groq';
    const model = body.model || 'llama-3.3-70b-versatile';

    return this.aiService.generate(body.prompt, model, provider);
  }
}

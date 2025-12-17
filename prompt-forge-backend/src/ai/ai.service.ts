import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly groqApiKey = process.env.GROQ_API_KEY;
  private readonly groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

  async generateText(promptText: string, model: string) {
    try {
      const response = await axios.post(
        this.groqUrl,
        {
          model: model || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage, // Token counts
        model: model,
      };
    } catch (error) {
      console.error('AI Error:', error.response?.data || error.message);
      throw new Error('Failed to communicate with AI provider');
    }
  }
}

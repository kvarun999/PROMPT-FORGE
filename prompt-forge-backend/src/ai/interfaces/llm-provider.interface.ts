export interface LlmProvider {
  generateResponse(prompt: string, model: string, config?: any): Promise<any>;
}

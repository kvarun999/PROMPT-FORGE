// prompt-forge-backend/check-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in .env');
    return;
  }

  console.log('🔍 Checking available models for your API Key...');

  // We use the REST API directly to list models because the SDK helper is sometimes tricky
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();

    if (data.error) {
      console.error('❌ API Error:', data.error.message);
      return;
    }

    console.log('\n✅ AVAILABLE MODELS:');
    const models = data.models || [];
    const chatModels = models
      .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''));

    console.log(chatModels.join('\n'));
    console.log(
      '\n👉 Please use one of the names above in your Playground.vue',
    );
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

listModels();

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// List of models from your previous check-models.js output to try
const CANDIDATES = [
  'gemini-2.0-flash-lite-preview-02-05', // Often has better free limits
  'gemini-2.0-flash-exp', // Experimental often works
  'gemini-2.5-flash', // Newest stable
  'gemini-1.5-flash', // Standard Flash
  'gemini-pro', // Old reliable
];

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  console.log('🧪 Starting connection test...\n');

  for (const modelName of CANDIDATES) {
    console.log(`👉 Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'Hello' if you work.");
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ SUCCESS! Model '${modelName}' is working.`);
        console.log(`   Output: ${text}`);
        console.log(
          `\n🎉 ACTION REQUIRED: Update Playground.vue to use '${modelName}'`,
        );
        return; // Stop after finding the first working one
      }
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('Quota')) {
        console.log(`❌ Failed: Quota exceeded or limit is 0.`);
      } else if (
        error.message.includes('404') ||
        error.message.includes('not found')
      ) {
        console.log(`❌ Failed: Model not found.`);
      } else {
        console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
      }
    }
    console.log('---');
  }

  console.log('\n⚠️ No working models found in the candidate list.');
  console.log(
    'Please check your Google Cloud Console Billing status or create a new API Key.',
  );
}

testModels();

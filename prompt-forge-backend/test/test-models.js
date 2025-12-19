// prompt-forge-backend/test-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// 1. Define Candidates
const GEMINI_CANDIDATES = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-2.0-flash-lite-preview-02-05',
];

// Groq usually lets us list them, but we will test the popular ones
const GROQ_CANDIDATES = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

async function testAll() {
  console.log('🚀 Starting Model Availability Test...\n');

  const workingGroq = [];
  const workingGemini = [];

  // --- TEST GEMINI ---
  if (process.env.GEMINI_API_KEY) {
    console.log('--- Testing Gemini ---');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of GEMINI_CANDIDATES) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Set a timeout to avoid hanging
        const result = await Promise.race([
          model.generateContent('Hi'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000),
          ),
        ]);
        const response = await result.response;
        if (response.text()) {
          console.log('✅ Working');
          workingGemini.push(modelName);
        }
      } catch (e) {
        console.log(`❌ Failed (${e.message.split(' ')[0]})`);
      }
    }
  } else {
    console.log('⚠️ No GEMINI_API_KEY found.');
  }

  // --- TEST GROQ ---
  if (process.env.GROQ_API_KEY) {
    console.log('\n--- Testing Groq ---');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    for (const modelName of GROQ_CANDIDATES) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        await groq.chat.completions.create({
          messages: [{ role: 'user', content: 'Hi' }],
          model: modelName,
        });
        console.log('✅ Working');
        workingGroq.push(modelName);
      } catch (e) {
        console.log(`❌ Failed (${e.error?.code || e.message})`);
      }
    }
  } else {
    console.log('⚠️ No GROQ_API_KEY found.');
  }

  console.log('\n\n🎉 === FINAL WORKING LIST ===');
  console.log('Copy these into your Playground.vue:\n');

  console.log('// Groq Models');
  workingGroq.forEach((m) => console.log(`<option value="${m}">${m}</option>`));

  console.log('\n// Gemini Models');
  workingGemini.forEach((m) =>
    console.log(`<option value="${m}">${m}</option>`),
  );
}

testAll();

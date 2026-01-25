// Test script for OpenAI API integration (TypeScript, OpenAI v4+)
// Usage: npx ts-node scripts/openaiTest.ts
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const apiKey: string | undefined = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function testOpenAI(): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' },
      ],
    });
    console.log('OpenAI API response:', response.choices[0].message?.content);
  } catch (error: any) {
    if (error.response) {
      console.error('Error calling OpenAI API:', error.response.data);
    } else {
      console.error('Error calling OpenAI API:', error.message);
    }
  }
}

testOpenAI();

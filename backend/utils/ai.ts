import axios from 'axios';

export async function getRelevance(pdfText: string, jobDescription: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const prompt = `You are an expert recruiter. Given the following applicant resume text and job description, answer in 1-2 sentences: Is this applicant relevant for the job? Explain why or why not.\n\nResume Text:\n${pdfText}\n\nJob Description:\n${jobDescription}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.5,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data.choices?.[0]?.message?.content?.trim() || 'No summary.';
}

export async function getSummary(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const prompt = `Summarize the following resume or document in 3-5 sentences for a recruiter.\n\n${text}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.5,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data.choices?.[0]?.message?.content?.trim() || 'No summary.';
}

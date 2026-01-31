import axios from 'axios';

export async function getRelevance(pdfText: string, jobDescription: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  
  const prompt = `Given the following applicant resume text and job description, 
                  answer in 1-2 sentences: Is this applicant relevant for the job? 
                  Explain why or why not.\n\n
                  Resume Text:\n${pdfText}\n\n
                  Job Description:\n${jobDescription}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert recruiter.' },
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

export async function getKeywords(pdfText: string, jobDescription: string): Promise<{
  pdfTextKeywords: string[],
  jobDescriptionKeywords: string[],
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key');

  const prompt = `Extract keywords (single words or short phrases, comma-separated) 
                  from each of the following two texts.\n\n- 
                  For the resume, put keywords only in the array called pdfTextKeywords.\n- 
                  For the job description, put keywords only in the array called jobDescriptionKeywords.\n- 
                  Do not repeat any keyword in both arrays.\n
                  Return a JSON object with two arrays: pdfTextKeywords, jobDescriptionKeywords. 
                  Example format: { 
                                    "pdfTextKeywords": ["..."], 
                                    "jobDescriptionKeywords": ["..."] 
                                  }\n\n
                                  Resume Text:\n${pdfText}\n\n
                                  Job Description:\n${jobDescription}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert recruiter and NLP specialist.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  // Try to parse the response as JSON
  const content = response.data.choices?.[0]?.message?.content?.trim() || '{}';
  try {
    const result = JSON.parse(content);
    return {
      pdfTextKeywords: Array.isArray(result.pdfTextKeywords) ? result.pdfTextKeywords : [],
      jobDescriptionKeywords: Array.isArray(result.jobDescriptionKeywords) ? result.jobDescriptionKeywords : [],
    };
  } catch (e) {
    // fallback: return empty arrays if parsing fails
    return {
      pdfTextKeywords: [],
      jobDescriptionKeywords: [],
    };
  }
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
        { role: 'system', content: 'You are an expert recruiter.' },
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

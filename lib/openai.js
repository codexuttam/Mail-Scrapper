import OpenAI from 'openai';

const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generateOutreach({ name, type, location, tone, senderName }) {
  const prompt = `Write a ${tone} cold outreach message to a ${type} named ${name} in ${location}. 
  The message is from ${senderName || 'AutoClient'}. 
  Mention that they don't have a website and offer affordable website services. 
  Keep it short, persuasive, and personalize to the business name. 
  End with a polite call to action.`;

  const response = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });

  const text = response.choices?.[0]?.message?.content || '';
  return text.trim();
}

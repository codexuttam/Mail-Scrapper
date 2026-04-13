import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateOutreach({ name, type, location, tone }) {
  const prompt = `Write a ${tone} cold outreach message to a ${type} named ${name} in ${location}. Mention that they don't have a website and offer affordable website services. Keep it short, persuasive, and personalize to the business name.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });

  const text = response.choices?.[0]?.message?.content || '';
  return text.trim();
}

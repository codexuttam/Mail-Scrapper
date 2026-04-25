import OpenAI from 'openai';

const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generateOutreach({ name, type, location, tone, senderName, channel = 'email' }) {
  let platformContext = "";
  if (channel === 'dm') {
    platformContext = "This is for an Instagram/Social Media DM. Keep it very short, casual, and use 1-2 emojis. Start with a friendly high-energy opener.";
  } else if (channel === 'whatsapp') {
    platformContext = "This is for a WhatsApp message. Keep it direct, professional yet personal, and very concise. Use a clear question at the end.";
  } else {
    platformContext = "This is for a professional cold email. Use a catchy subject line at the top, a formal greeting, and a more detailed value proposition.";
  }

  const prompt = `Write a ${tone} outreach message to a ${type} named ${name} in ${location}. 
  ${platformContext}
  The message is from ${senderName || 'AutoClient'}. 
  Focus on offering value and increasing their client base. 
  Keep it persuasive and personalize to the business name.`;

  const response = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });

  const text = response.choices?.[0]?.message?.content || '';
  return text.trim();
}

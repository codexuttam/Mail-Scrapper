import OpenAI from 'openai';
import { ensureEnv } from './env';

// Validate only the env vars this module needs.
ensureEnv(['GROQ_API_KEY']);

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function generateOutreach({ name, type, location, tone, senderName, channel = 'email', campaignType = 'intro', model = 'llama-3.3-70b-versatile' }) {
  let platformContext = "";
  if (channel === 'dm') {
    platformContext = "This is for an Instagram/Social Media DM. Keep it very short, casual, and use 1-2 emojis. Start with a friendly high-energy opener.";
  } else if (channel === 'whatsapp') {
    platformContext = "This is for a WhatsApp message. Keep it direct, professional yet personal, and very concise. Use a clear question at the end.";
  } else {
    platformContext = "This is for a professional cold email. Use a catchy subject line at the top, a formal greeting, and a more detailed value proposition.";
  }

  let campaignContext = "";
  if (campaignType === 'offer') {
    campaignContext = "This is a special offer campaign. Emphasize a limited-time discount or a specific value-add that they can't refuse.";
  } else if (campaignType === 'partnership') {
    campaignContext = "This is a partnership proposal. Focus on mutual benefit and how both businesses can grow together.";
  } else if (campaignType === 'followup') {
    campaignContext = "This is a follow-up message. Reference a previous attempt to contact them and keep it brief and helpful.";
  } else {
    campaignContext = "This is a general introduction. Focus on how our services can help them get more clients and grow their business.";
  }

  const prompt = `Write a ${tone} outreach message to a ${type} named ${name} in ${location}. 
  ${platformContext}
  ${campaignContext}
  The message is from ${senderName || 'AutoClient'}. 
  Keep it persuasive and personalize to the business name.`;

  const response = await client.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });

  const text = response.choices?.[0]?.message?.content || '';
  return text.trim();
}

export async function generateSummary({ name, type, websiteText }) {
  if (!websiteText || websiteText.length < 50) return "";
  
  const prompt = `Summarize this business in exactly one punchy, professional sentence that highlights their core service and USP.
  Business Name: ${name}
  Business Type: ${type}
  Website Text Snippet: ${websiteText.substring(0, 2000)}
  
  Format: Just the sentence, no labels or quotes.`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100
    });
    return response.choices?.[0]?.message?.content?.trim() || "";
  } catch (e) {
    console.error("Summary generation failed:", e);
    return "";
  }
}

export async function scoreLead({ name, type, summary, email, website }) {
  let score = 0;
  if (email) score += 30;
  if (website) score += 20;
  if (summary && summary.length > 20) score += 10;
  
  const prompt = `Rate this business lead on a scale of 0 to 40 based on its potential value for a digital marketing agency.
  Name: ${name}
  Type: ${type}
  Summary: ${summary}
  
  Return ONLY a number. No text.`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10
    });
    const aiScore = parseInt(response.choices?.[0]?.message?.content?.trim() || "0");
    return Math.min(100, score + (isNaN(aiScore) ? 0 : aiScore));
  } catch (e) {
    console.error("Scoring failed:", e);
    return score;
  }
}

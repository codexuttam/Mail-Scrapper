import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateOutreach } from '../../../lib/openai';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';
import Settings from '../../../models/Settings';

export async function POST(req) {
  try {
    const { name, type, location, tone, leadId, channel, campaignType } = await req.json();

    if (!name || !type || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connect();
    const settings = await Settings.findOne();
    const senderName = settings?.fullName || 'Uttamraj Singh';
    const model = settings?.aiModel || 'llama-3.3-70b-versatile';
    const customPrompt = settings?.customPrompt || '';
    const templateIntro = settings?.templateIntro || '';
    const templateOffer = settings?.templateOffer || '';
    const templatePartnership = settings?.templatePartnership || '';

    const message = await generateOutreach({ 
      name, 
      type, 
      location, 
      tone: tone || 'friendly', 
      senderName,
      channel: channel || 'email',
      campaignType: campaignType || 'intro',
      model,
      customPrompt,
      templateIntro,
      templateOffer,
      templatePartnership
    });

    // Optionally save to DB if leadId provided
    if (process.env.MONGODB_URI && leadId) {
      try {
        const lead = await Lead.findById(leadId);
        if (lead) {
          lead.message = message;
          lead.lastSentAt = new Date();
          lead.activities.push({ 
            type: 'email_sent', 
            description: `Generated outreach email message (Tone: ${tone || 'friendly'}, Channel: ${channel || 'email'})` 
          });
          await lead.save();
        }
      } catch (e) {
        console.error('Failed to update lead message/activity', e);
      }
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error('generate error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

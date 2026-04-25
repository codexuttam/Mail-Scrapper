import { NextResponse } from 'next/server';
import { generateOutreach } from '../../../lib/openai';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';
import Settings from '../../../models/Settings';

export async function POST(req) {
  try {
    const { name, type, location, tone, leadId } = await req.json();

    if (!name || !type || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connect();
    const settings = await Settings.findOne();
    const senderName = settings?.fullName || 'Uttamraj Singh';

    const message = await generateOutreach({ 
      name, 
      type, 
      location, 
      tone: tone || 'friendly', 
      senderName 
    });

    // Optionally save to DB if leadId provided
    if (process.env.MONGODB_URI && leadId) {
      await Lead.findByIdAndUpdate(leadId, { message }, { new: true }).catch(() => null);
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error('generate error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

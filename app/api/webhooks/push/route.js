import { NextResponse } from 'next/server';
import connect from '../../../../lib/db';
import Lead from '../../../../models/Lead';
import Settings from '../../../../models/Settings';

export async function POST(req) {
  try {
    const { leadIds } = await req.json();

    if (!leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json({ error: 'Missing leadIds array' }, { status: 400 });
    }

    await connect();
    const settings = await Settings.findOne();
    const webhookUrl = settings?.webhookUrl;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'No webhook URL configured in settings' }, { status: 400 });
    }

    const leads = await Lead.find({ _id: { $in: leadIds } });
    
    if (leads.length === 0) {
      return NextResponse.json({ error: 'No leads found for provided IDs' }, { status: 404 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        event: 'leads_pushed',
        timestamp: new Date().toISOString(),
        leads: leads.map(l => ({
          name: l.name,
          email: l.email,
          phone: l.phone,
          address: l.address,
          website: l.website,
          summary: l.summary,
          status: l.status,
          notes: l.notes,
          socials: l.socials
        }))
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook failed: ${response.status} ${errorText}`);
    }

    return NextResponse.json({ ok: true, message: `Successfully pushed ${leads.length} leads to CRM.` });
  } catch (err) {
    console.error('webhook push error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';
import Settings from '../../../models/Settings';
import { generateOutreach } from '../../../lib/openai';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { leadIds, tone, campaignType, channel } = await req.json();

    if (!leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json({ error: 'Missing leadIds array' }, { status: 400 });
    }

    await connect();
    const settings = await Settings.findOne();
    const senderName = settings?.fullName || 'Uttamraj Singh';
    const aiModel = settings?.aiModel || 'llama-3.3-70b-versatile';

    // SMTP Setup
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    let transporter;
    let usingTestAccount = false;

    if (process.env.SMTP_TEST === 'true' || !host || !user || !pass) {
      usingTestAccount = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: (process.env.SMTP_SECURE === 'true') || Number(port) === 465,
        auth: { user, pass }
      });
    }

    const fromAddress = process.env.SMTP_USER || (usingTestAccount ? 'no-reply@autoclient.ai' : undefined);
    const results = [];

    for (const id of leadIds) {
      try {
        const lead = await Lead.findById(id);
        if (!lead || !lead.email) {
          results.push({ id, status: 'skipped', reason: 'No email or lead not found' });
          continue;
        }

        // 1. Generate Message
        const message = await generateOutreach({
          name: lead.name,
          type: lead.type || 'business',
          location: lead.location || '',
          tone: tone || 'friendly',
          senderName,
          channel: channel || 'email',
          campaignType: campaignType || 'intro',
          model: aiModel
        });

        // 2. Send Email
        const info = await transporter.sendMail({
          from: fromAddress,
          to: lead.email,
          subject: `Personalized Outreach for ${lead.name}`,
          text: message
        });

        // 3. Update Lead
        await Lead.findByIdAndUpdate(id, { 
          status: 'sent', 
          message, 
          lastSentAt: new Date() 
        });

        results.push({ 
          id, 
          status: 'success', 
          previewUrl: usingTestAccount ? nodemailer.getTestMessageUrl(info) : null 
        });
      } catch (err) {
        console.error(`Failed to process lead ${id}:`, err);
        results.push({ id, status: 'error', reason: err.message });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error('bulk-outreach error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

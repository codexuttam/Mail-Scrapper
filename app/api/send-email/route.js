import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connect from '@/lib/db';
import Lead from '@/models/Lead';

export async function POST(req) {
  try {
    const { to, subject, text, html, leadId, from } = await req.json();

    if (!to || !subject || !(text || html)) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, text/html' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return NextResponse.json({ error: 'SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: (process.env.SMTP_SECURE === 'true') || Number(port) === 465,
      auth: { user, pass }
    });

    const fromAddress = from || process.env.SMTP_USER;

    const info = await transporter.sendMail({ from: fromAddress, to, subject, text, html });

    // Update lead status to sent if leadId provided
    if (leadId && process.env.MONGODB_URI) {
      await connect();
      await Lead.findByIdAndUpdate(leadId, { status: 'sent', $set: { lastSentAt: new Date() } });
    }

    return NextResponse.json({ ok: true, info });
  } catch (err) {
    console.error('send-email error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

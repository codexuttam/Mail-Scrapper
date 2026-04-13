import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';

export async function POST(req) {
  try {
    const { to, subject, text, html, leadId, from } = await req.json();

    if (!to || !subject || !(text || html)) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, text/html' }, { status: 400 });
    }

    let transporter;
    let usingTestAccount = false;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // If SMTP_TEST is set to 'true' or SMTP not configured, fall back to nodemailer test account (Ethereal)
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

    const fromAddress = from || process.env.SMTP_USER || (usingTestAccount ? 'no-reply@example.com' : undefined);

    const info = await transporter.sendMail({ from: fromAddress, to, subject, text, html });

    // Update lead status to sent if leadId provided
    if (leadId && process.env.MONGODB_URI) {
      await connect();
      await Lead.findByIdAndUpdate(leadId, { status: 'sent', $set: { lastSentAt: new Date() } });
    }

    const response = { ok: true, info };
    if (usingTestAccount) {
      // Add preview URL for Ethereal test messages
      const preview = nodemailer.getTestMessageUrl(info);
      response.previewUrl = preview;
    }
    return NextResponse.json(response);
  } catch (err) {
    console.error('send-email error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

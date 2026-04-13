import { NextResponse } from 'next/server';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';

export async function GET(req) {
  try {
    await connect();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const filter = {};
    if (status) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ leads });
  } catch (err) {
    console.error('leads GET error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await connect();
    const lead = await Lead.create(body);
    return NextResponse.json({ lead });
  } catch (err) {
    console.error('leads POST error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    await connect();
    const lead = await Lead.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ lead });
  } catch (err) {
    console.error('leads PATCH error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    await connect();
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('leads DELETE error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

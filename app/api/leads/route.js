import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connect();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const filter = { userEmail: session.user.email };
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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json();
    if (!body.name) delete body.name; 
    await connect();
    const lead = await Lead.create({ ...body, userEmail: session.user.email });
    return NextResponse.json({ lead });
  } catch (err) {
    console.error('leads POST error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    await connect();
    const lead = await Lead.findOneAndUpdate({ _id: id, userEmail: session.user.email }, updates, { new: true });
    return NextResponse.json({ lead });
  } catch (err) {
    console.error('leads PATCH error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    await connect();
    await Lead.findOneAndDelete({ _id: id, userEmail: session.user.email });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('leads DELETE error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

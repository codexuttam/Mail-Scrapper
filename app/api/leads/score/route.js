import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import connect from '../../../../lib/db';
import Lead from '../../../../models/Lead';
import { scoreLead } from '../../../../lib/openai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

    await connect();
    const lead = await Lead.findOne({ _id: id, userEmail: session.user.email });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const score = await scoreLead({
      name: lead.name,
      type: lead.type,
      summary: lead.summary,
      email: lead.email,
      website: lead.website
    });

    lead.score = score;
    await lead.save();

    return NextResponse.json({ lead });
  } catch (err) {
    console.error('score POST error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

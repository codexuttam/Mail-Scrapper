import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import connect from '../../../../lib/db';
import Lead from '../../../../models/Lead';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = params;
    await connect();
    const lead = await Lead.findOne({ _id: id, userEmail: session.user.email }).lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    
    return NextResponse.json({ lead });
  } catch (err) {
    console.error('lead GET error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

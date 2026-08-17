import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connect from '../../../../lib/db';
import ScrapeJob from '../../../../models/ScrapeJob';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: { message: "Missing jobId" } }, { status: 400 });
    }

    await connect();

    const job = await ScrapeJob.findOne({ jobId, userEmail: session.user.email });

    if (!job) {
      return NextResponse.json({ error: { message: "Job not found" } }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      results: job.results,
      saved: job.saved,
      error: job.error
    });
  } catch (err) {
    console.error('Job status error:', err);
    return NextResponse.json({ error: { message: String(err) } }, { status: 500 });
  }
}

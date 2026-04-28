import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { scrapeBusinesses } from '../../../lib/scraper';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    const { query, save } = await req.json();
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

    if (save && !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await scrapeBusinesses(query);

    // If save flag provided and DB configured, persist leads (upsert by name+address+userEmail)
    if (save && process.env.MONGODB_URI) {
      await connect();
      const saved = [];
      for (const item of data) {
        const filter = { name: item.name || '', address: item.address || '', userEmail: session.user.email };
        const update = {
          name: item.name || 'Unknown',
          email: (item.emails && item.emails.length > 0) ? item.emails[0] : '',
          phone: item.phone || '',
          address: item.address || '',
          website: item.website || item.link || '',
          socials: item.socials || {},
          location: query,
          status: 'new',
          userEmail: session.user.email
        };
        const doc = await Lead.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
        saved.push(doc);
      }
      return NextResponse.json({ data, saved });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('scrape error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

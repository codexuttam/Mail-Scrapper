import { NextResponse } from 'next/server';
import { scrapeBusinesses } from '@/lib/scraper';
import connect from '@/lib/db';
import Lead from '@/models/Lead';

export async function POST(req) {
  try {
    const { query, save } = await req.json();
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

    const data = await scrapeBusinesses(query);

    // If save flag provided and DB configured, persist leads (upsert by name+address)
    if (save && process.env.MONGODB_URI) {
      await connect();
      const saved = [];
      for (const item of data) {
        const filter = { name: item.name || '', address: item.address || '' };
        const update = {
          name: item.name || 'Unknown',
          phone: item.phone || '',
          address: item.address || '',
          website: item.link || '',
          location: query,
          type: '',
          status: 'new'
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

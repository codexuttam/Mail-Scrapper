import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { scrapeBusinesses } from '../../../lib/scraper';
import { generateSummary } from '../../../lib/openai';
import connect from '../../../lib/db';
import Lead from '../../../models/Lead';
import ScrapeCache from '../../../models/ScrapeCache';
import ScrapeJob from '../../../models/ScrapeJob';
import { randomUUID } from 'crypto';

const rateLimitMap = new Map();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    const { query, save } = await req.json();
    if (!query) return NextResponse.json({ error: { message: 'Missing query' } }, { status: 400 });

    if (save && !session) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 })

    await connect();

    // In-memory Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || (session ? session.user.email : 'anonymous');
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 5;

    const windowStart = now - windowMs;
    const requestTimestamps = rateLimitMap.get(ip) || [];
    const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      return NextResponse.json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many scrape requests. Please try again later.' } }, { status: 429 });
    }

    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);

    let data;
    const cachedData = await ScrapeCache.findOne({ query });

    if (cachedData) {
      data = cachedData.results;
      
      if (save && process.env.MONGODB_URI) {
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
            summary: item.summary || '',
            userEmail: session.user.email
          };
          const doc = await Lead.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
          saved.push(doc);
        }
        return NextResponse.json({ data, saved });
      }

      return NextResponse.json({ data });
    } else {
      const jobId = randomUUID();
      await ScrapeJob.create({
        jobId,
        query,
        userEmail: session.user.email,
        saveToDb: save
      });

      // Spawn background process without awaiting
      processScrapeJob(jobId, query, save, session.user.email).catch(console.error);

      return NextResponse.json({ jobId, message: 'Scraping started in background' });
    }
  } catch (err) {
    console.error('scrape error', err);
    return NextResponse.json({ error: { message: String(err) } }, { status: 500 });
  }
}

async function processScrapeJob(jobId, query, save, userEmail) {
  try {
    await connect();
    await ScrapeJob.findOneAndUpdate({ jobId }, { status: 'processing', progress: 'Launching scraper...' });

    const data = await scrapeBusinesses(query);

    await ScrapeJob.findOneAndUpdate({ jobId }, { progress: 'Generating AI summaries...' });

    await Promise.all(data.map(async (item) => {
      if (item.websiteText) {
        item.summary = await generateSummary({ 
          name: item.name, 
          type: query.split(' in ')[0] || 'business', 
          websiteText: item.websiteText 
        });
      }
    }));

    await ScrapeCache.create({ query, results: data });
    
    let saved = [];
    if (save && process.env.MONGODB_URI) {
      await ScrapeJob.findOneAndUpdate({ jobId }, { progress: 'Saving to CRM...' });
      for (const item of data) {
        const filter = { name: item.name || '', address: item.address || '', userEmail };
        const update = {
          name: item.name || 'Unknown',
          email: (item.emails && item.emails.length > 0) ? item.emails[0] : '',
          phone: item.phone || '',
          address: item.address || '',
          website: item.website || item.link || '',
          socials: item.socials || {},
          location: query,
          status: 'new',
          summary: item.summary || '',
          userEmail
        };
        const doc = await Lead.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
        saved.push(doc);
      }
    }

    await ScrapeJob.findOneAndUpdate({ jobId }, { 
      status: 'completed', 
      progress: 'Done',
      results: data,
      saved
    });

  } catch (err) {
    console.error('Background scrape job failed:', err);
    await ScrapeJob.findOneAndUpdate({ jobId }, { 
      status: 'failed', 
      error: String(err),
      progress: 'Failed'
    });
  }
}

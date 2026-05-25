import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
    const trash = url.searchParams.get('trash') === 'true';
    
    const filter = { userEmail: session.user.email };
    if (trash) {
      filter.archived = true;
    } else {
      filter.archived = { $ne: true };
    }
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
    const lead = await Lead.create({ 
      ...body, 
      userEmail: session.user.email,
      activities: [{ type: 'created', description: `Lead captured via ${body.source || 'Search / Scraping'}` }]
    });
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

    const { id, ids, updates, tagsToAdd } = await req.json();
    await connect();

    if (ids && Array.isArray(ids)) {
      const query = { _id: { $in: ids }, userEmail: session.user.email };
      const update = {};
      if (updates) update.$set = updates;
      if (tagsToAdd) update.$addToSet = { tags: { $each: Array.isArray(tagsToAdd) ? tagsToAdd : [tagsToAdd] } };
      
      await Lead.updateMany(query, update);
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    const lead = await Lead.findOne({ _id: id, userEmail: session.user.email });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const newActivities = [];
    if (updates) {
      if (updates.status && updates.status !== lead.status) {
        newActivities.push({ type: 'status_change', description: `Status updated to ${updates.status.toUpperCase()}` });
      }
      if (updates.notes && updates.notes !== lead.notes) {
        newActivities.push({ type: 'note_save', description: 'Internal notes updated' });
      }
      if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(lead.tags)) {
        newActivities.push({ type: 'tag_update', description: 'Tags updated' });
      }
      if (updates.archived !== undefined && updates.archived !== lead.archived) {
        newActivities.push({ 
          type: updates.archived ? 'archived' : 'unarchived', 
          description: updates.archived ? 'Moved to Recycle Bin' : 'Restored from Recycle Bin' 
        });
      }
      
      Object.assign(lead, updates);
    }
    
    if (newActivities.length > 0) {
      lead.activities.push(...newActivities);
    }

    await lead.save();
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

    const { id, ids, permanent, restore } = await req.json();
    await connect();

    const targetIds = ids || (id ? [id] : []);
    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'Missing lead id or ids' }, { status: 400 });
    }

    const query = { _id: { $in: targetIds }, userEmail: session.user.email };

    if (restore) {
      const leads = await Lead.find(query);
      for (const lead of leads) {
        lead.archived = false;
        lead.activities.push({ type: 'unarchived', description: 'Restored from Recycle Bin' });
        await lead.save();
      }
      return NextResponse.json({ ok: true });
    }

    if (permanent) {
      await Lead.deleteMany(query);
      return NextResponse.json({ ok: true });
    }

    // Default: Soft Delete (Archive)
    const leads = await Lead.find(query);
    for (const lead of leads) {
      lead.archived = true;
      lead.activities.push({ type: 'archived', description: 'Moved to Recycle Bin' });
      await lead.save();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('leads DELETE error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

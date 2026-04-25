import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import connect from '../../../lib/db';
import Settings from '../../../models/Settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connect();
    let settings = await Settings.findOne({ userEmail: session.user.email });
    
    // Environment defaults
    const envDefaults = {
      fullName: session.user.name,
      email: session.user.email,
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
      openaiApiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || ''
    };

    if (!settings) {
      return NextResponse.json({ 
        settings: { 
          ...envDefaults,
          userEmail: session.user.email
        } 
      });
    }

    // Merge DB settings with ENV defaults (preferring DB)
    const mergedSettings = {
      ...envDefaults,
      ...settings.toObject()
    };
    
    return NextResponse.json({ settings: mergedSettings });
  } catch (err) {
    console.error('settings GET error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json();
    await connect();
    
    const settings = await Settings.findOneAndUpdate(
      { userEmail: session.user.email },
      { ...body, userEmail: session.user.email, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('settings POST error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

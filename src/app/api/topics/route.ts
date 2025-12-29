import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Topic } from '@/models/Topic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const topic = await Topic.findOne({ code });
      if (!topic) {
        return NextResponse.json({ error: 'Mavzu topilmadi' }, { status: 404 });
      }
      return NextResponse.json(topic);
    }

    const topics = await Topic.find().sort({ createdAt: -1 });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate unique 6-digit code
    let code: string;
    let exists = true;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await Topic.findOne({ code });
      exists = !!existing;
    } while (exists);

    const topic = await Topic.create({
      code,
      title: body.title,
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

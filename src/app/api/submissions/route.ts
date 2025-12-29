import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { Topic } from '@/models/Topic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const submissions = await Submission.find()
      .populate('mavzuId', 'title code')
      .sort({ date: -1 });
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const submission = await Submission.create(body);
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

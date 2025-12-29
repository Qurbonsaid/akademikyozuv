import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Topic } from '@/models/Topic';
import { Question } from '@/models/Question';
import { Submission } from '@/models/Submission';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const topic = await Topic.findById(params.id);
    
    if (!topic) {
      return NextResponse.json({ error: 'Mavzu topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const topic = await Topic.findByIdAndUpdate(
      params.id,
      { title: body.title },
      { new: true }
    );
    
    if (!topic) {
      return NextResponse.json({ error: 'Mavzu topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Delete associated questions
    await Question.deleteMany({ mavzuId: params.id });
    
    // Delete associated submissions
    await Submission.deleteMany({ mavzuId: params.id });
    
    const topic = await Topic.findByIdAndDelete(params.id);
    
    if (!topic) {
      return NextResponse.json({ error: 'Mavzu topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

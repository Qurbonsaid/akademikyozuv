import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Question } from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const question = await Question.findById(params.id);
    
    if (!question) {
      return NextResponse.json({ error: 'Savol topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json(question);
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
    
    const question = await Question.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );
    
    if (!question) {
      return NextResponse.json({ error: 'Savol topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json(question);
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
    const question = await Question.findByIdAndDelete(params.id);
    
    if (!question) {
      return NextResponse.json({ error: 'Savol topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Question } from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const mavzuId = searchParams.get('mavzuId');

    if (mavzuId) {
      const questions = await Question.find({ mavzuId }).sort({ order: 1 });
      return NextResponse.json(questions);
    }

    const questions = await Question.find().sort({ order: 1 });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Get the next order number
    const lastQuestion = await Question.findOne({ mavzuId: body.mavzuId }).sort({ order: -1 });
    const order = lastQuestion ? lastQuestion.order + 1 : 1;

    const question = await Question.create({
      ...body,
      order,
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

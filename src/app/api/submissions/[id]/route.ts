import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { Question } from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const submission = await Submission.findById(params.id)
      .populate('mavzuId', 'title code');
    
    if (!submission) {
      return NextResponse.json({ error: 'Javob topilmadi' }, { status: 404 });
    }

    // Get all questions for this submission
    const questionIds = submission.answers.map((a: any) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    return NextResponse.json({ submission, questions });
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
    const submission = await Submission.findByIdAndDelete(params.id);
    
    if (!submission) {
      return NextResponse.json({ error: 'Javob topilmadi' }, { status: 404 });
    }
    
    return NextResponse.json({ message: "O'chirildi" });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

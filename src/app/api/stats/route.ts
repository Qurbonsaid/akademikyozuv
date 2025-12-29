import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Topic } from '@/models/Topic';
import { Question } from '@/models/Question';
import { Submission } from '@/models/Submission';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const [topicsCount, questionsCount, submissionsCount, recentSubmissions] = await Promise.all([
      Topic.countDocuments(),
      Question.countDocuments(),
      Submission.countDocuments(),
      Submission.find()
        .populate('mavzuId', 'title')
        .sort({ date: -1 })
        .limit(5)
    ]);

    return NextResponse.json({
      topicsCount,
      questionsCount,
      submissionsCount,
      recentSubmissions,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

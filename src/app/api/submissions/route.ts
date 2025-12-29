import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { SUBMISSION_COLLECTION, ISubmission, IAnswer } from '@/models/Submission';
import { QUESTION_COLLECTION, IQuestion } from '@/models/Question';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';

// GET - List all submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const mavzuId = searchParams.get('mavzuId');

    const db = await getDatabase();
    const submissionsCollection = db.collection<ISubmission>(SUBMISSION_COLLECTION);

    const query: Record<string, unknown> = {};
    if (mavzuId && ObjectId.isValid(mavzuId)) {
      query.mavzuId = new ObjectId(mavzuId);
    }

    const submissions = await submissionsCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return successResponse(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new submission (public - students submit their answers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mavzuId, fullName, group, answers } = body;

    // Validate required fields
    if (!mavzuId || !fullName || !group || !answers) {
      return errorResponse('mavzuId, fullName, group, and answers are required', 400);
    }

    if (!ObjectId.isValid(mavzuId)) {
      return errorResponse('Invalid mavzuId', 400);
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return errorResponse('Answers must be a non-empty array', 400);
    }

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);
    const submissionsCollection = db.collection<ISubmission>(SUBMISSION_COLLECTION);

    // Get all questions for this topic to validate answers
    const questions = await questionsCollection
      .find({ mavzuId: new ObjectId(mavzuId) })
      .toArray();

    if (questions.length === 0) {
      return errorResponse('No questions found for this topic', 404);
    }

    // Create a map for quick lookup
    const questionMap = new Map<string, IQuestion>();
    questions.forEach((q) => {
      questionMap.set(q._id!.toString(), q);
    });

    // Process and validate answers
    let totalScore = 0;
    const maxScore = questions.length;
    const processedAnswers: IAnswer[] = [];

    for (const ans of answers) {
      const { questionId, answer } = ans;

      if (!questionId || !ObjectId.isValid(questionId)) {
        return errorResponse(`Invalid questionId: ${questionId}`, 400);
      }

      const question = questionMap.get(questionId);
      if (!question) {
        return errorResponse(`Question not found: ${questionId}`, 404);
      }

      let isCorrect = false;

      if (question.type === 'choice') {
        // For choice questions, answer should be the index
        isCorrect = Number(answer) === question.correctIndex;
      } else if (question.type === 'text') {
        // For text questions, compare case-insensitively and trim
        isCorrect =
          String(answer).trim().toLowerCase() ===
          (question.correctAnswer || '').trim().toLowerCase();
      }

      if (isCorrect) {
        totalScore++;
      }

      processedAnswers.push({
        questionId: new ObjectId(questionId),
        answer,
        isCorrect,
      });
    }

    const newSubmission: ISubmission = {
      mavzuId: new ObjectId(mavzuId),
      fullName,
      group,
      date: new Date(),
      totalScore,
      maxScore,
      answers: processedAnswers,
    };

    const result = await submissionsCollection.insertOne(newSubmission);

    return successResponse({
      message: 'Submission created successfully',
      submission: {
        _id: result.insertedId,
        ...newSubmission,
      },
    }, 201);
  } catch (error) {
    console.error('Create submission error:', error);
    return errorResponse('Internal server error', 500);
  }
}

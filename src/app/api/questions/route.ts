import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { QUESTION_COLLECTION, IQuestion } from '@/models/Question';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';

// Helper to strip correct answers from questions for public access
function stripCorrectAnswers(questions: IQuestion[]): Partial<IQuestion>[] {
  return questions.map(({ correctIndex, correctAnswer, ...rest }) => rest);
}

// GET - List questions (public gets stripped answers, admin gets full)
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    const isAdmin = !!auth;

    const { searchParams } = new URL(request.url);
    const mavzuId = searchParams.get('mavzuId');
    const topicId = searchParams.get('topicId'); // alias for mavzuId

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);

    const query: Record<string, unknown> = {};
    const topicIdValue = mavzuId || topicId;
    if (topicIdValue && ObjectId.isValid(topicIdValue)) {
      query.mavzuId = new ObjectId(topicIdValue);
    }

    const questions = await questionsCollection
      .find(query)
      .sort({ order: 1 })
      .toArray();

    // If not admin, strip correct answers
    if (!isAdmin) {
      return successResponse(stripCorrectAnswers(questions));
    }

    return successResponse(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create a new question (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { mavzuId, type, order, question, options, correctIndex, correctAnswer } = body;

    // Validate required fields
    if (!mavzuId || !type || order === undefined || !question) {
      return errorResponse('mavzuId, type, order, and question are required', 400);
    }

    if (!ObjectId.isValid(mavzuId)) {
      return errorResponse('Invalid mavzuId', 400);
    }

    if (!['text', 'choice'].includes(type)) {
      return errorResponse('Type must be either "text" or "choice"', 400);
    }

    // Validate based on type
    if (type === 'choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return errorResponse('Choice questions require at least 2 options', 400);
      }
      if (correctIndex === undefined || correctIndex < 0 || correctIndex >= options.length) {
        return errorResponse('Invalid correctIndex for choice question', 400);
      }
    } else if (type === 'text') {
      if (!correctAnswer) {
        return errorResponse('Text questions require correctAnswer', 400);
      }
    }

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);

    const newQuestion: IQuestion = {
      mavzuId: new ObjectId(mavzuId),
      type,
      order: Number(order),
      question,
      ...(type === 'choice' && { options, correctIndex }),
      ...(type === 'text' && { correctAnswer }),
    };

    const result = await questionsCollection.insertOne(newQuestion);

    return successResponse({
      message: 'Question created successfully',
      question: {
        _id: result.insertedId,
        ...newQuestion,
      },
    }, 201);
  } catch (error) {
    console.error('Create question error:', error);
    return errorResponse('Internal server error', 500);
  }
}

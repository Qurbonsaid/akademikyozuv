import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { QUESTION_COLLECTION, IQuestion } from '@/models/Question';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to strip correct answers from a question for public access
function stripCorrectAnswer(question: IQuestion): Partial<IQuestion> {
  const { correctIndex, correctAnswer, ...rest } = question;
  return rest;
}

// GET - Get a single question by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    const isAdmin = !!auth;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid question ID', 400);
    }

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);

    const question = await questionsCollection.findOne({ _id: new ObjectId(id) });

    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // If not admin, strip correct answer
    if (!isAdmin) {
      return successResponse(stripCorrectAnswer(question));
    }

    return successResponse(question);
  } catch (error) {
    console.error('Get question error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Update a question (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid question ID', 400);
    }

    const body = await request.json();
    const { mavzuId, type, order, question, options, correctIndex, correctAnswer } = body;

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);

    // Get existing question to validate
    const existingQuestion = await questionsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingQuestion) {
      return errorResponse('Question not found', 404);
    }

    const updateData: Partial<IQuestion> = {};

    if (mavzuId) {
      if (!ObjectId.isValid(mavzuId)) {
        return errorResponse('Invalid mavzuId', 400);
      }
      updateData.mavzuId = new ObjectId(mavzuId);
    }

    if (type) {
      if (!['text', 'choice'].includes(type)) {
        return errorResponse('Type must be either "text" or "choice"', 400);
      }
      updateData.type = type;
    }

    if (order !== undefined) updateData.order = Number(order);
    if (question) updateData.question = question;

    const finalType = type || existingQuestion.type;

    if (finalType === 'choice') {
      if (options) {
        if (!Array.isArray(options) || options.length < 2) {
          return errorResponse('Choice questions require at least 2 options', 400);
        }
        updateData.options = options;
      }
      if (correctIndex !== undefined) {
        const finalOptions = options || existingQuestion.options || [];
        if (correctIndex < 0 || correctIndex >= finalOptions.length) {
          return errorResponse('Invalid correctIndex', 400);
        }
        updateData.correctIndex = correctIndex;
      }
      // Clear text-specific fields
      updateData.correctAnswer = undefined;
    } else if (finalType === 'text') {
      if (correctAnswer !== undefined) {
        updateData.correctAnswer = correctAnswer;
      }
      // Clear choice-specific fields
      updateData.options = undefined;
      updateData.correctIndex = undefined;
    }

    await questionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedQuestion = await questionsCollection.findOne({ _id: new ObjectId(id) });

    return successResponse({
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Update question error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete a question (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid question ID', 400);
    }

    const db = await getDatabase();
    const questionsCollection = db.collection<IQuestion>(QUESTION_COLLECTION);

    const result = await questionsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return errorResponse('Question not found', 404);
    }

    return successResponse({
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    return errorResponse('Internal server error', 500);
  }
}

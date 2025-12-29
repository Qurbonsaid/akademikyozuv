import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { SUBMISSION_COLLECTION, ISubmission } from '@/models/Submission';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single submission by ID (public - so students can see their results)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid submission ID', 400);
    }

    const db = await getDatabase();
    const submissionsCollection = db.collection<ISubmission>(SUBMISSION_COLLECTION);

    const submission = await submissionsCollection.findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    return successResponse(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Delete a submission (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid submission ID', 400);
    }

    const db = await getDatabase();
    const submissionsCollection = db.collection<ISubmission>(SUBMISSION_COLLECTION);

    const result = await submissionsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return errorResponse('Submission not found', 404);
    }

    return successResponse({
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    return errorResponse('Internal server error', 500);
  }
}

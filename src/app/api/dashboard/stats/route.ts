import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { TOPIC_COLLECTION } from '@/models/Topic';
import { QUESTION_COLLECTION } from '@/models/Question';
import { SUBMISSION_COLLECTION, ISubmission } from '@/models/Submission';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';

// GET - Get dashboard statistics using aggregations (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const db = await getDatabase();

    // Use Promise.all to run aggregations in parallel
    const [
      topicsCount,
      questionsStats,
      submissionsCount,
      recentSubmissions,
    ] = await Promise.all([
      // Count topics
      db.collection(TOPIC_COLLECTION).countDocuments(),

      // Get question stats by type using aggregation
      db.collection(QUESTION_COLLECTION).aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]).toArray(),

      // Count submissions
      db.collection(SUBMISSION_COLLECTION).countDocuments(),

      // Get recent 5 submissions with topic lookup
      db.collection<ISubmission>(SUBMISSION_COLLECTION).aggregate([
        { $sort: { date: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: TOPIC_COLLECTION,
            localField: 'mavzuId',
            foreignField: '_id',
            as: 'topic',
          },
        },
        {
          $unwind: {
            path: '$topic',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            group: 1,
            date: 1,
            totalScore: 1,
            maxScore: 1,
            mavzuId: 1,
            topicTitle: '$topic.title',
          },
        },
      ]).toArray(),
    ]);

    // Process question stats
    let choiceCount = 0;
    let textCount = 0;
    (questionsStats as Array<{ _id: string; count: number }>).forEach((stat) => {
      if (stat._id === 'choice') choiceCount = stat.count;
      if (stat._id === 'text') textCount = stat.count;
    });
    const totalQuestions = choiceCount + textCount;

    return successResponse({
      topics: {
        total: topicsCount,
      },
      questions: {
        total: totalQuestions,
        choice: choiceCount,
        text: textCount,
      },
      submissions: {
        total: submissionsCount,
      },
      recentSubmissions,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse('Internal server error', 500);
  }
}

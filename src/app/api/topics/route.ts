import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { TOPIC_COLLECTION, ITopic } from "@/models/Topic";
import {
  errorResponse,
  successResponse,
  verifyAuth,
  unauthorizedResponse,
} from "@/lib/middleware";

// GET - List all topics (public)
export async function GET() {
  try {
    const db = await getDatabase();
    const topicsCollection = db.collection<ITopic>(TOPIC_COLLECTION);

    const topics = await topicsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(topics);
  } catch (error) {
    console.error("Get topics error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST - Create a new topic (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return errorResponse("Title is required", 400);
    }

    const db = await getDatabase();
    const topicsCollection = db.collection<ITopic>(TOPIC_COLLECTION);

    // Check if title already exists
    const existingTopic = await topicsCollection.findOne({ title });
    if (existingTopic) {
      return errorResponse("Topic with this title already exists", 400);
    }

    const newTopic: ITopic = {
      title,
      createdAt: new Date(),
    };

    const result = await topicsCollection.insertOne(newTopic);

    return successResponse(
      {
        message: "Topic created successfully",
        topic: {
          _id: result.insertedId,
          ...newTopic,
        },
      },
      201
    );
  } catch (error) {
    console.error("Create topic error:", error);
    return errorResponse("Internal server error", 500);
  }
}

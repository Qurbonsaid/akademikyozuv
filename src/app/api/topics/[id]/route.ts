import { NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { TOPIC_COLLECTION, ITopic } from "@/models/Topic";
import {
  errorResponse,
  successResponse,
  verifyAuth,
  unauthorizedResponse,
} from "@/lib/middleware";
import { ObjectId } from "mongodb";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single topic by ID (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid topic ID", 400);
    }

    const db = await getDatabase();
    const topicsCollection = db.collection<ITopic>(TOPIC_COLLECTION);

    const topic = await topicsCollection.findOne({ _id: new ObjectId(id) });

    if (!topic) {
      return errorResponse("Topic not found", 404);
    }

    return successResponse(topic);
  } catch (error) {
    console.error("Get topic error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT - Update a topic (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid topic ID", 400);
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return errorResponse("At least one field (title) is required", 400);
    }

    const db = await getDatabase();
    const topicsCollection = db.collection<ITopic>(TOPIC_COLLECTION);

    const updateData: Partial<ITopic> = {};
    if (title) updateData.title = title;

    const result = await topicsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return errorResponse("Topic not found", 404);
    }

    const updatedTopic = await topicsCollection.findOne({
      _id: new ObjectId(id),
    });

    return successResponse({
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("Update topic error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE - Delete a topic (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid topic ID", 400);
    }

    const db = await getDatabase();
    const topicsCollection = db.collection<ITopic>(TOPIC_COLLECTION);

    const result = await topicsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return errorResponse("Topic not found", 404);
    }

    return successResponse({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Delete topic error:", error);
    return errorResponse("Internal server error", 500);
  }
}

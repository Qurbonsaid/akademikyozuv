import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ADMIN_COLLECTION, IAdmin } from '@/models/Admin';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { errorResponse, successResponse, verifyAuth, unauthorizedResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters long', 400);
    }

    // Get database and admin collection
    const db = await getDatabase();
    const adminsCollection = db.collection<IAdmin>(ADMIN_COLLECTION);

    // Find admin by ID
    const admin = await adminsCollection.findOne({ _id: new ObjectId(auth.userId) });

    if (!admin) {
      return errorResponse('Admin not found', 404);
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, admin.password);

    if (!isPasswordValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await adminsCollection.updateOne(
      { _id: new ObjectId(auth.userId) },
      { $set: { password: hashedPassword } }
    );

    return successResponse({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

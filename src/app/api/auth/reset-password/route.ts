import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ADMIN_COLLECTION, IAdmin } from '@/models/Admin';
import { hashPassword } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/middleware';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "JWT_SECRET"');
}

const JWT_SECRET = process.env.JWT_SECRET;

interface ResetTokenPayload {
  email: string;
  purpose: string;
  userId: string;
}

// POST - Reset password using reset token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword } = body;

    if (!resetToken || !newPassword) {
      return errorResponse('Reset token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters long', 400);
    }

    // Verify reset token
    let payload: ResetTokenPayload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET) as ResetTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return errorResponse('Reset token has expired. Please request a new one.', 401);
      }
      return errorResponse('Invalid reset token', 401);
    }

    // Check that this is a password reset token
    if (payload.purpose !== 'password_reset') {
      return errorResponse('Invalid reset token', 401);
    }

    const db = await getDatabase();
    const adminsCollection = db.collection<IAdmin>(ADMIN_COLLECTION);

    // Find admin by ID from token
    const admin = await adminsCollection.findOne({ _id: new ObjectId(payload.userId) });

    if (!admin) {
      return errorResponse('User not found', 404);
    }

    // Verify email matches
    if (admin.email !== payload.email) {
      return errorResponse('Invalid reset token', 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await adminsCollection.updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { password: hashedPassword } }
    );

    return successResponse({
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

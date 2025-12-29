import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ADMIN_COLLECTION, IAdmin } from '@/models/Admin';
import { errorResponse, successResponse } from '@/lib/middleware';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "JWT_SECRET"');
}

const JWT_SECRET = process.env.JWT_SECRET;

// POST - Request password reset (generates a reset token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const db = await getDatabase();
    const adminsCollection = db.collection<IAdmin>(ADMIN_COLLECTION);

    // Find admin by email
    const admin = await adminsCollection.findOne({ email });

    if (!admin) {
      // Don't reveal if email exists or not for security
      return successResponse({
        message: 'If an account with this email exists, a reset token has been generated',
      });
    }

    // Generate reset token with short expiration (15 minutes)
    const resetToken = jwt.sign(
      {
        email: admin.email,
        purpose: 'password_reset',
        userId: admin._id!.toString(),
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // In a real application, you would send this token via email
    // For API-only usage, we return the token directly
    return successResponse({
      message: 'Password reset token generated successfully',
      resetToken,
      expiresIn: '15 minutes',
      note: 'Use this token with POST /api/auth/reset-password to reset your password',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Internal server error', 500);
  }
}

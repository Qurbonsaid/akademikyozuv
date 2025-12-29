import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ADMIN_COLLECTION, IAdmin } from '@/models/Admin';
import { verifyPassword, generateToken } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Get database and admin collection
    const db = await getDatabase();
    const adminsCollection = db.collection<IAdmin>(ADMIN_COLLECTION);

    // Find admin by email
    const admin = await adminsCollection.findOne({ email });

    if (!admin) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      email: admin.email,
      userId: admin._id!.toString(),
    });

    return successResponse({
      message: 'Login successful',
      token,
      admin: {
        email: admin.email,
        id: admin._id!.toString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

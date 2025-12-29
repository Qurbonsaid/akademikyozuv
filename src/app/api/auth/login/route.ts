import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    
    if (!admin) {
      return NextResponse.json({ error: 'Email yoki parol xato' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Email yoki parol xato' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      admin: { email: admin.email, id: admin._id } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Server xatosi',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

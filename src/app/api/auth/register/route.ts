import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Register API called');
    
    await dbConnect();
    console.log('DB connected');
    
    const body = await request.json();
    const { email, password, secretKey } = body;

    // Maxfiy kalit tekshiruvi (xavfsizlik uchun)
    if (secretKey !== 'akademik-yozuv-2024-secret') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    // Email mavjudligini tekshirish
    const existingAdmin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 400 });
    }

    // Parolni hash qilish
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Admin yaratish
    const admin = await Admin.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin muvaffaqiyatli yaratildi',
      admin: { email: admin.email, id: admin._id } 
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ 
      error: 'Server xatosi', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

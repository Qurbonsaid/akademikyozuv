import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Environment variable tekshiruvi
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return NextResponse.json({ 
        error: 'MONGODB_URI environment variable is not set',
        env: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('NEXT'))
      }, { status: 500 });
    }

    // MongoDB ulanish
    await dbConnect();

    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      mongoUriExists: !!mongoUri,
      mongoUriStart: mongoUri.substring(0, 30) + '...'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

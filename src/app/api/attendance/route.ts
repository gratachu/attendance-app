import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { insertAttendanceRecord, getLatestAttendanceRecord, getTodayAttendanceRecords } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();
    
    if (type !== 'check-in' && type !== 'check-out') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const latestRecord = await getLatestAttendanceRecord(userId);
    
    if (latestRecord && latestRecord.type === type) {
      return NextResponse.json(
        { error: `Already ${type === 'check-in' ? 'checked in' : 'checked out'}` },
        { status: 400 }
      );
    }

    const record = await insertAttendanceRecord(userId, type);
    
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (date === 'today') {
      const records = await getTodayAttendanceRecords(userId);
      return NextResponse.json({ records });
    }
    
    const latestRecord = await getLatestAttendanceRecord(userId);
    return NextResponse.json({ latestRecord });
  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
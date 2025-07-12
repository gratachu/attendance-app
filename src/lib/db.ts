import { sql } from '@vercel/postgres';

export type AttendanceRecord = {
  id: number;
  user_id: string;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  created_at: Date;
};

export async function createAttendanceTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('check-in', 'check-out')),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance_records(timestamp);
    `;
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

export async function insertAttendanceRecord(userId: string, type: 'check-in' | 'check-out') {
  try {
    const result = await sql`
      INSERT INTO attendance_records (user_id, type)
      VALUES (${userId}, ${type})
      RETURNING *;
    `;
    return result.rows[0] as AttendanceRecord;
  } catch (error) {
    console.error('Error inserting attendance record:', error);
    throw error;
  }
}

export async function getLatestAttendanceRecord(userId: string): Promise<AttendanceRecord | null> {
  try {
    const result = await sql`
      SELECT * FROM attendance_records 
      WHERE user_id = ${userId} 
      ORDER BY timestamp DESC 
      LIMIT 1;
    `;
    return result.rows[0] as AttendanceRecord || null;
  } catch (error) {
    console.error('Error getting latest attendance record:', error);
    throw error;
  }
}

export async function getTodayAttendanceRecords(userId: string): Promise<AttendanceRecord[]> {
  try {
    const result = await sql`
      SELECT * FROM attendance_records 
      WHERE user_id = ${userId} 
      AND DATE(timestamp AT TIME ZONE 'Asia/Tokyo') = CURRENT_DATE 
      ORDER BY timestamp ASC;
    `;
    return result.rows as AttendanceRecord[];
  } catch (error) {
    console.error('Error getting today attendance records:', error);
    throw error;
  }
}
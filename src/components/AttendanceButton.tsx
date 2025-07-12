'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface AttendanceRecord {
  id: number;
  user_id: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  created_at: string;
}

export default function AttendanceButton() {
  const { user } = useUser();
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const fetchAttendanceData = async () => {
    try {
      const [latestResponse, todayResponse] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/attendance?date=today')
      ]);
      
      const latestData = await latestResponse.json();
      const todayData = await todayResponse.json();
      
      setLastRecord(latestData.latestRecord);
      setTodayRecords(todayData.records || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setInitializing(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      await fetch('/api/init-db', { method: 'POST' });
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  useEffect(() => {
    if (user) {
      initializeDatabase().then(() => fetchAttendanceData());
    }
  }, [user]);

  const handleAttendance = async (type: 'check-in' | 'check-out') => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchAttendanceData();
      } else {
        alert(data.error || 'エラーが発生しました');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const nextAction = lastRecord?.type === 'check-in' ? 'check-out' : 'check-in';
  const buttonText = nextAction === 'check-in' ? '出勤' : '退勤';
  const buttonClass = nextAction === 'check-in' 
    ? 'bg-blue-500 hover:bg-blue-600' 
    : 'bg-red-500 hover:bg-red-600';

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">出退勤管理</h1>
        <p className="text-gray-600">ようこそ、{user?.firstName || user?.emailAddresses[0]?.emailAddress}さん</p>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={() => handleAttendance(nextAction)}
          disabled={loading}
          className={`${buttonClass} text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full`}
        >
          {loading ? '処理中...' : buttonText}
        </button>
      </div>

      {todayRecords.length > 0 && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">本日の記録</h2>
          <div className="space-y-2">
            {todayRecords.map((record) => (
              <div key={record.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className={`font-medium ${record.type === 'check-in' ? 'text-blue-600' : 'text-red-600'}`}>
                  {record.type === 'check-in' ? '出勤' : '退勤'}
                </span>
                <span className="text-gray-600">{formatTime(record.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastRecord && (
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-600">
            最後の記録: {lastRecord.type === 'check-in' ? '出勤' : '退勤'} - {formatTime(lastRecord.timestamp)}
          </p>
        </div>
      )}
    </div>
  );
}
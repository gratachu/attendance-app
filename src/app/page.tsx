import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import AttendanceButton from '@/components/AttendanceButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">出退勤管理アプリ</h1>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    ログイン
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedIn>
          <div className="flex justify-center">
            <AttendanceButton />
          </div>
        </SignedIn>
        
        <SignedOut>
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">出退勤管理アプリへようこそ</h2>
            <p className="text-lg text-gray-600 mb-8">ログインして出退勤を記録しましょう</p>
            <SignInButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors">
                ログインして始める
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

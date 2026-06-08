'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext, useCoupleContext } from '@couple-calendar/shared';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();
  const { partner } = useCoupleContext();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-50">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Couple Calendar</h1>
            <p className="text-slate-400 text-sm">Welcome, {user?.displayName || user?.email}!</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!partner ? (
          // Not paired yet
          <>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-50 mb-4">Ready to pair? 💑</h2>
              <p className="text-slate-400 mb-8">
                Connect with your partner to start sharing calendar events and todo lists.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => router.push('/pairing/generate')}
                  className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Generate Invite
                </button>
                <button
                  onClick={() => router.push('/pairing/accept')}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Enter Partner's Code
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">📅 Calendar</h3>
                <p className="text-slate-400 text-sm">View and manage events together</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">✓ Todo Lists</h3>
                <p className="text-slate-400 text-sm">Collaborate on tasks and checklists</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">🔔 Notifications</h3>
                <p className="text-slate-400 text-sm">Stay updated on partner activities</p>
              </div>
            </div>
          </>
        ) : (
          // Already paired
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">Welcome to Couple Calendar! 🎉</h2>
            <p className="text-slate-400 mb-8">
              You're all set! Calendar and todo features are coming soon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">📅 Calendar</h3>
                <p className="text-slate-400 text-sm">View and manage events together</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">✓ Todo Lists</h3>
                <p className="text-slate-400 text-sm">Collaborate on tasks and checklists</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-50 font-semibold mb-2">🔔 Notifications</h3>
                <p className="text-slate-400 text-sm">Stay updated on partner activities</p>
              </div>
            </div>

            <div className="p-6 bg-sky-500/10 border border-sky-500/50 rounded-lg">
              <p className="text-sky-300">
                Coming soon: Calendar events and todo lists!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

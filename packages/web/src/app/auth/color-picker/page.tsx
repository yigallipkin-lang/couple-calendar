'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@couple-calendar/shared';
import { VIBRANT_COLORS } from '@couple-calendar/shared';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const COLORS = Array.from(VIBRANT_COLORS);

export default function ColorPickerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleContinue = async () => {
    if (!user) {
      setError('User not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user's color in Firestore
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        color: selectedColor,
      });

      // Redirect to pairing screen (will be implemented)
      // For now, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to save color. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Pick Your Color</h1>
          <p className="text-slate-400">
            Choose a color that represents you in the calendar. Your partner will see events in your color.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Color Grid */}
        <div className="mb-8 p-8 bg-slate-900/50 border border-slate-700 rounded-lg">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`aspect-square rounded-lg transition-all duration-200 ${
                  selectedColor === color
                    ? 'ring-4 ring-slate-50 scale-105'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                disabled={loading}
                title={color}
              />
            ))}
          </div>

          {/* Selected Color Preview */}
          <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-slate-600">
            <p className="text-slate-300 text-sm mb-3">Your color:</p>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-slate-50 font-semibold">{selectedColor}</p>
                <p className="text-slate-400 text-sm">
                  This is how your partner will see your calendar events
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={loading || authLoading}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {loading ? 'Saving...' : 'Continue to Dashboard'}
        </button>

        {/* Info */}
        <p className="text-center text-slate-400 text-sm mt-6">
          You can change your color anytime in settings
        </p>
      </div>
    </div>
  );
}

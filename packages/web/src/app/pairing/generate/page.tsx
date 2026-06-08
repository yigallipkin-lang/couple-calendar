'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext, usePairing, formatPairingCode, formatTimeRemaining } from '@couple-calendar/shared';

function GeneratePairingContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { state, loading, error, generateInvite, clearError } = usePairing();
  const [copied, setCopied] = useState(false);

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  // Generate code on mount
  useEffect(() => {
    if (!state.code && !authLoading) {
      generateInvite().catch(() => {
        // Error is handled by usePairing
      });
    }
  }, [authLoading]);

  const handleCopy = () => {
    if (state.code) {
      navigator.clipboard.writeText(formatPairingCode(state.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (state.code) {
      const shareUrl = `https://couple-calendar.app/pairing/accept?code=${state.code}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!state.code) return;
    const shareUrl = `https://couple-calendar.app/pairing/accept?code=${state.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Couple Calendar',
          text: 'Let\'s sync our calendar and todos!',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-50 text-sm mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Share Your Invite</h1>
          <p className="text-slate-400">
            Send this code to your partner so they can join you
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 text-xs mt-2 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading && !state.code ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500" />
            <p className="text-slate-400 mt-4">Generating invite...</p>
          </div>
        ) : state.code ? (
          <div className="space-y-6">
            {/* Code Card */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8">
              <p className="text-slate-400 text-sm mb-3">
                Your invite code (valid {state.expiresAt ? formatTimeRemaining(state.expiresAt) : '...'}):
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={formatPairingCode(state.code)}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 font-mono text-lg text-center"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Share URL */}
              <div className="mb-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">Or share this link:</p>
                <p className="text-slate-50 text-sm break-all font-mono">
                  https://couple-calendar.app/pairing/accept?code={state.code}
                </p>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg font-semibold transition-colors"
                >
                  {copied ? '✓ Link Copied' : 'Copy Link'}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg font-semibold transition-colors"
                  >
                    Share
                  </button>
                )}
              </div>
            </div>

            {/* Waiting Message */}
            <div className="bg-sky-500/10 border border-sky-500/50 rounded-lg p-6 text-center">
              <p className="text-sky-300 animate-pulse">
                🔄 Waiting for your partner to join...
              </p>
              <p className="text-sky-200 text-sm mt-2">
                This page will update automatically when they accept
              </p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors"
            >
              Cancel & Go Back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function GeneratePairingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><p className="text-slate-400">Loading...</p></div>}>
      <GeneratePairingContent />
    </Suspense>
  );
}

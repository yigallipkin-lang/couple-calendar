'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext, usePairing, formatPairingCode } from '@couple-calendar/shared';

function AcceptPairingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthContext();
  const { state, loading, error, validateCode, acceptInvite, clearError } = usePairing();

  const [inputCode, setInputCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);

  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  // Check if code is in URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && !inputCode) {
      setInputCode(urlCode);
      handleValidate(urlCode);
    }
  }, [searchParams]);

  const handleValidate = async (code: string) => {
    setValidating(true);
    try {
      await validateCode(code);
      setValidated(true);
    } catch (err) {
      setValidated(false);
    } finally {
      setValidating(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptInvite(inputCode);
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      // Error will be shown in error message
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
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Join Your Partner</h1>
          <p className="text-slate-400">
            Enter the invite code they shared with you
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

        <div className="space-y-6">
          {/* Code Input */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8">
            <p className="text-slate-400 text-sm mb-4">Enter 9-character code:</p>

            <input
              type="text"
              value={formatPairingCode(inputCode)}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setValidated(false);
              }}
              placeholder="ABC-DEF-GHI"
              maxLength={11}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 font-mono text-lg text-center mb-4"
            />

            {validated && state.expiresAt && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm">✓ Code is valid</p>
              </div>
            )}

            <button
              onClick={() => handleValidate(formatPairingCode(inputCode))}
              disabled={validating || loading || inputCode.length < 9}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {validating ? 'Validating...' : 'Validate Code'}
            </button>
          </div>

          {/* Partner Preview */}
          {validated && state.generatorName && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8">
              <p className="text-slate-400 text-sm mb-4">Confirm pair with:</p>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: state.generatorColor || '#000000' }}
                />
                <div>
                  <p className="text-slate-50 font-semibold text-lg">
                    {state.generatorName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {state.generatorColor}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Pairing...' : 'Confirm & Pair'}
              </button>
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcceptPairingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><p className="text-slate-400">Loading...</p></div>}>
      <AcceptPairingContent />
    </Suspense>
  );
}

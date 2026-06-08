'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@couple-calendar/shared';

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setSuccess(false);

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      // Error is handled by useAuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Reset Password</h1>
          <p className="text-slate-400">
            {success
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-500 text-sm">{displayError}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
            <p className="text-emerald-500 text-sm">
              Password reset email sent! Check your inbox and click the link to reset your password.
            </p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (displayError) setLocalError(null);
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                disabled={loading}
              />
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="mt-6 text-center text-sm space-y-2">
          <p>
            Remember your password?{' '}
            <Link href="/auth/login" className="text-sky-500 hover:text-sky-400 font-semibold">
              Sign in
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-sky-500 hover:text-sky-400 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

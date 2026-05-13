'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agents/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden rounded-sm"
      >
        {/* Header */}
        <div className="bg-navy border-b border-white/10 px-10 py-12 text-center flex flex-col items-center">
          <div className="relative w-56 h-20 mb-4">
            <Image
              src="/logo-transparent.png"
              alt="BYD Properties Logo"
              fill
              className="object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
              priority
            />
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Agent Portal</p>
        </div>

        {/* Body */}
        <div className="px-10 py-10">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Success icon */}
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">Check your inbox</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                If an account exists for <strong className="text-navy">{email}</strong>, we&apos;ve sent a password reset link. The link expires in 1 hour.
              </p>
              <Link href="/agent/login" className="btn-primary w-full flex items-center justify-center">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-navy mb-1">Forgot your password?</h2>
              <p className="text-gray-400 text-sm mb-7">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Remember your password?{' '}
                  <Link href="/agent/login" className="text-navy font-semibold hover:text-gold transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

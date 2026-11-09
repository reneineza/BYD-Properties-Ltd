'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, Loader2, RefreshCcw, ArrowLeft } from 'lucide-react';

function OtpVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 min until OTP expires
  const [cooldown, setCooldown] = useState(60);  // 60s resend cooldown
  const timerRef = useRef(null);
  const cooldownRef = useRef(null);

  // Changing email modal
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [changeEmailError, setChangeEmailError] = useState('');

  const otpInputs = useRef([]);

  // ── OTP Expiry timer ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Cooldown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── OTP input handlers ────────────────────────────────────────────────────
  function handleOtpChange(index, val) {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // only last digit
    setOtp(newOtp);
    setError('');

    if (val && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (val && newOtp.every(d => d !== '') && index === 5) {
      submitOtp(newOtp.join(''));
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpInputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpInputs.current[index + 1]?.focus();
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => { if (i < 6) newOtp[i] = d; });
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputs.current[nextIdx]?.focus();
    if (pasted.length === 6) {
      submitOtp(pasted);
    }
  }

  // ── Submit OTP ────────────────────────────────────────────────────────────
  const submitOtp = useCallback(async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        clearInterval(timerRef.current);
        // Redirect after 3 seconds
        setTimeout(() => router.push('/agent/login?verified=1'), 3000);
      } else {
        setError(data.error || 'Verification failed. Please try again.');
        // Clear the OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [email, otp, router]);

  function handleVerifyClick() {
    submitOtp(otp.join(''));
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/agents/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
        // Reset timers
        setTimeLeft(300);
        setCooldown(60);
      } else {
        setError(data.error || 'Failed to resend code. Please try again shortly.');
        if (data.remainingSeconds) setCooldown(data.remainingSeconds);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  }

  // ── Change Email ──────────────────────────────────────────────────────────
  async function handleChangeEmail(e) {
    e.preventDefault();
    if (!newEmail.trim() || changingEmail) return;

    setChangingEmail(true);
    setChangeEmailError('');

    try {
      const res = await fetch('/api/agents/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail: email, newEmail: newEmail.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmail(data.newEmail || newEmail.trim().toLowerCase());
        setShowChangeEmail(false);
        setNewEmail('');
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(300);
        setCooldown(60);
      } else {
        setChangeEmailError(data.error || 'Could not change email. Please try again.');
      }
    } catch {
      setChangeEmailError('Network error. Please try again.');
    } finally {
      setChangingEmail(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy mb-3">Email Verified!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your email address has been verified successfully. Your application is now pending administrator approval.
            <br /><br />
            You will receive an email notification once your account is reviewed.
          </p>
          <div className="bg-cream rounded-xl p-4 text-xs text-navy/60 mb-6">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
              Redirecting to login…
            </div>
          </div>
          <Link href="/agent/login" className="btn-primary w-full">Go to Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      {/* Change Email Modal */}
      <AnimatePresence>
        {showChangeEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowChangeEmail(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
            >
              <h3 className="font-display text-xl font-bold text-navy mb-2">Change Email Address</h3>
              <p className="text-gray-400 text-sm mb-6">
                Enter a new email address. We&apos;ll send a fresh verification code there.
              </p>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/50 mb-1.5">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="new@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                    required
                  />
                  {changeEmailError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {changeEmailError}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowChangeEmail(false); setChangeEmailError(''); }}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-navy text-sm font-semibold hover:border-navy transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingEmail}
                    className="flex-1 px-4 py-3 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold-dark transition-all disabled:opacity-70"
                  >
                    {changingEmail ? 'Updating…' : 'Update Email'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-navy border-b border-white/10 px-10 py-10 text-center flex flex-col items-center">
          <Link href="/">
            <Image src="/logo-transparent.png" alt="BYD Properties" width={160} height={56} className="h-14 w-auto object-contain opacity-90 mb-3" />
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-gold" />
            </div>
            <div className="text-left">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Step 2 of 4</p>
              <p className="text-white text-sm font-semibold">Email Verification</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 py-8">
          <h1 className="font-display text-2xl font-bold text-navy mb-2">Verify Your Email Address</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            We have sent a six-digit verification code to:
          </p>
          <p className="text-navy font-bold text-sm mb-6 bg-cream/60 px-4 py-2 rounded-lg inline-block">
            {email}
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Boxes */}
          <div className="mb-6">
            <div className="flex justify-center gap-2.5 mb-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpInputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                    digit
                      ? 'border-gold bg-gold/5 text-navy'
                      : 'border-gray-200 text-navy focus:border-gold focus:ring-2 focus:ring-gold/20'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Expiry countdown */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {timeLeft > 0 ? (
                <span className="text-gray-400">
                  Code expires in <span className={`font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-navy'}`}>{formatTime(timeLeft)}</span>
                </span>
              ) : (
                <span className="text-red-500 font-semibold">Code expired. Please request a new one.</span>
              )}
            </div>
          </div>

          {/* Verify button */}
          <button
            type="button"
            onClick={handleVerifyClick}
            disabled={loading || otp.join('').length < 6}
            className="w-full py-3.5 rounded-xl bg-gold text-white font-bold text-sm hover:bg-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Verify Email</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Resend */}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-navy text-sm font-semibold hover:border-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {resending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            ) : cooldown > 0 ? (
              <><RefreshCcw className="w-4 h-4" /> Resend in {cooldown}s</>
            ) : (
              <><RefreshCcw className="w-4 h-4" /> Resend Verification Code</>
            )}
          </button>

          {/* Change email & back */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
            <Link href="/become-agent" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Registration
            </Link>
            <button
              type="button"
              onClick={() => { setShowChangeEmail(true); setChangeEmailError(''); }}
              className="text-xs text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              Change Email Address
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    }>
      <OtpVerifyContent />
    </Suspense>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Clock, XCircle, ShieldAlert } from 'lucide-react';

// Decode login error codes set in authOptions
function parseLoginError(errorStr) {
  if (!errorStr) return null;
  if (errorStr.startsWith('EMAIL_NOT_VERIFIED')) {
    const email = errorStr.split(':')[1] || '';
    return {
      type: 'unverified',
      icon: Mail,
      color: 'blue',
      title: 'Email Not Verified',
      message: "Your email address hasn't been verified yet. Please check your inbox or request a new verification code.",
      action: email ? { label: 'Verify Email', href: `/agent/verify-email?email=${encodeURIComponent(email)}` } : null,
    };
  }
  if (errorStr === 'ACCOUNT_PENDING') {
    return {
      type: 'pending',
      icon: Clock,
      color: 'yellow',
      title: 'Application Under Review',
      message: 'Your email is verified. Your account is currently awaiting administrator approval. You will be notified by email once reviewed.',
    };
  }
  if (errorStr.startsWith('ACCOUNT_REJECTED')) {
    const reason = errorStr.split(':').slice(1).join(':') || '';
    return {
      type: 'rejected',
      icon: XCircle,
      color: 'red',
      title: 'Application Not Approved',
      message: reason
        ? `Your application was not approved. Reason: ${reason}`
        : 'Your application was not approved. Please contact us for more information.',
      action: { label: 'Contact Support', href: '/contact' },
    };
  }
  if (errorStr === 'ACCOUNT_SUSPENDED') {
    return {
      type: 'suspended',
      icon: ShieldAlert,
      color: 'orange',
      title: 'Account Suspended',
      message: 'Your agent account has been suspended. Please contact BYD Properties support for assistance.',
      action: { label: 'Contact Support', href: '/contact' },
    };
  }
  return {
    type: 'invalid',
    icon: AlertCircle,
    color: 'red',
    title: 'Invalid Credentials',
    message: 'The email, phone number, or password you entered is incorrect. Please try again.',
  };
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', text: 'text-blue-700', icon: 'text-blue-500', btn: 'bg-blue-600 hover:bg-blue-700' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800', text: 'text-yellow-700', icon: 'text-yellow-500', btn: '' },
  red: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800', text: 'text-red-700', icon: 'text-red-500', btn: 'bg-red-600 hover:bg-red-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800', text: 'text-orange-700', icon: 'text-orange-500', btn: 'bg-orange-600 hover:bg-orange-700' },
};

function StatusMessage({ parsed }) {
  if (!parsed) return null;
  const c = COLOR_MAP[parsed.color] || COLOR_MAP.red;
  const Icon = parsed.icon || AlertCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 mb-6 ${c.bg} ${c.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.icon}`} />
        <div className="flex-1">
          <p className={`font-bold text-sm mb-1 ${c.title}`}>{parsed.title}</p>
          <p className={`text-xs leading-relaxed ${c.text}`}>{parsed.message}</p>
          {parsed.action && (
            <Link
              href={parsed.action.href}
              className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-white transition-colors ${c.btn}`}
            >
              {parsed.action.label} →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AgentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for query param errors (from layout redirect) and success messages
  const qError = searchParams.get('error');
  const isVerified = searchParams.get('verified') === '1';

  // Map layout redirect errors to our format
  const qErrorMapped = qError === 'unverified' ? `EMAIL_NOT_VERIFIED:${searchParams.get('email') || ''}`
    : qError === 'pending' ? 'ACCOUNT_PENDING'
    : qError === 'rejected' ? `ACCOUNT_REJECTED:${searchParams.get('reason') || ''}`
    : qError === 'suspended' ? 'ACCOUNT_SUSPENDED'
    : null;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(qErrorMapped ? parseLoginError(qErrorMapped) : null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    const result = await signIn('credentials', {
      email: identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.push('/agent');
      return;
    }

    // Parse error from NextAuth
    const rawError = result?.error || 'INVALID_CREDENTIALS';
    setLoginError(parseLoginError(rawError));
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-2xl overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div className="bg-navy border-b border-white/10 px-10 py-12 text-center flex flex-col items-center">
          <Link href="/">
            <Image
              src="/logo-transparent.png"
              alt="BYD Properties Logo"
              width={200}
              height={72}
              className="h-16 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] mb-3"
              priority
            />
          </Link>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Agent Portal</p>
        </div>

        {/* Form */}
        <div className="px-10 py-10">
          {/* Success banner after email verification */}
          <AnimatePresence>
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-0.5">Email Verified!</p>
                  <p className="text-xs text-green-700">
                    Your email is now verified. Your application is pending administrator approval. You&apos;ll receive an email once approved.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <StatusMessage parsed={loginError} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address or Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {identifier.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setLoginError(null); }}
                  placeholder="Email or +250 7XX XXX XXX"
                  className="input-field pl-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label">Password</label>
                <Link href="/agent/forgot-password" className="text-xs text-gray-400 hover:text-gold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(null); }}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Not an agent yet?{' '}
              <Link href="/become-agent" className="text-gold font-semibold hover:text-gold-dark transition-colors">
                Apply to Become an Agent
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    }>
      <AgentLoginContent />
    </Suspense>
  );
}

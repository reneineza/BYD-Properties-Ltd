'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, MapPin, Building2, Camera, Eye, EyeOff,
  CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Loader2, Shield,
} from 'lucide-react';

// ── Progress Step Labels ───────────────────────────────────────────────────
const PROGRESS_STEPS = ['Personal Information', 'Email Verification', 'Admin Approval', 'Account Activated'];

// ── Form Steps ─────────────────────────────────────────────────────────────
const FORM_STEPS = ['Personal Info', 'Account Security', 'Review & Submit'];

// ── Rwanda flag prefix helper ──────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+250', flag: '🇷🇼', label: 'Rwanda' },
  { code: '+254', flag: '🇰🇪', label: 'Kenya' },
  { code: '+256', flag: '🇺🇬', label: 'Uganda' },
  { code: '+255', flag: '🇹🇿', label: 'Tanzania' },
  { code: '+243', flag: '🇨🇩', label: 'DR Congo' },
  { code: '+1', flag: '🇺🇸', label: 'USA' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+33', flag: '🇫🇷', label: 'France' },
  { code: '+49', flag: '🇩🇪', label: 'Germany' },
  { code: '+86', flag: '🇨🇳', label: 'China' },
  { code: '+91', flag: '🇮🇳', label: 'India' },
  { code: '+971', flag: '🇦🇪', label: 'UAE' },
];

const RWANDA_LOCATIONS = [
  'Kigali', 'Nyarugenge', 'Gasabo', 'Kicukiro', 'Musanze', 'Rubavu', 'Rusizi',
  'Huye', 'Rwamagana', 'Kayonza', 'Muhanga', 'Karongi', 'Nyagatare', 'Other',
];

function ProgressBar({ activeStep }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-1">
        {PROGRESS_STEPS.map((label, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                done ? 'bg-gold border-gold text-white' :
                active ? 'bg-white border-gold text-gold ring-4 ring-gold/20' :
                'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div className={`hidden sm:block absolute w-full h-0.5 top-4 left-1/2 ${done ? 'bg-gold' : 'bg-gray-200'}`} />
              )}
              <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${
                active ? 'text-gold' : done ? 'text-navy' : 'text-gray-400'
              }`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {msg}
    </p>
  );
}

function FormInput({ label, icon: Icon, error, type = 'text', required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-navy/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border text-navy text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white ${
            error ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
          }`}
        />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function PhoneInput({ label, value, onChange, countryCode, onCountryCodeChange, error, required, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-navy/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 h-full px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm text-navy hover:border-gold transition-colors min-w-[80px]"
          >
            <span>{selected.flag}</span>
            <span className="font-mono text-xs">{selected.code}</span>
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-auto max-h-56 w-44"
              >
                {COUNTRY_CODES.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onCountryCodeChange(c.code); setOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gold/10 transition-colors text-left ${c.code === countryCode ? 'text-gold font-bold' : 'text-navy'}`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.label}</span>
                    <span className="ml-auto font-mono text-gray-400">{c.code}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          type="tel"
          value={value}
          onChange={onChange}
          placeholder={placeholder || '7XX XXX XXX'}
          className={`flex-1 px-4 py-3 rounded-xl border text-navy text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white ${
            error ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
          }`}
        />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function PasswordInput({ label, value, onChange, error, required, placeholder, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-navy/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Lock className="w-4 h-4" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
          className={`w-full pl-10 pr-11 py-3 rounded-xl border text-navy text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white ${
            error ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[\W_]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{c.ok ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BecomeAgentPage() {
  const router = useRouter();
  const photoRef = useRef(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneCountry: '+250',
    phone: '',
    whatsappCountry: '+250',
    whatsappNumber: '',
    agencyName: '',
    location: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setGlobalError('');
  }

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(er => ({ ...er, photo: 'Only image files are accepted.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, photo: 'Profile photo must be under 5 MB.' }));
      return;
    }
    setUploadingPhoto(true);
    setErrors(er => ({ ...er, photo: '' }));
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload?context=agent', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      set('profileImage', json.url);
    } catch (err) {
      setErrors(er => ({ ...er, photo: err.message || 'Photo upload failed. You can skip this step.' }));
      setPhotoPreview('');
      set('profileImage', '');
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Step Validation ───────────────────────────────────────────────────────
  function validateStep0() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    else if (form.fullName.trim().length < 3) errs.fullName = 'Please enter your full name (at least 3 characters).';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!emailRegex.test(form.email.trim())) errs.email = 'Please enter a valid email address.';

    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    else if (form.phone.replace(/\D/g, '').length < 7) errs.phone = 'Please enter a valid phone number.';

    if (!form.location) errs.location = 'Please select your location.';

    return errs;
  }

  function validateStep1() {
    const errs = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!form.password) errs.password = 'Password is required.';
    else if (!passwordRegex.test(form.password)) {
      errs.password = 'Password must be at least 8 characters with uppercase, lowercase, number & special character.';
    }
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  }

  function validateStep2() {
    const errs = {};
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the Terms and Conditions.';
    if (!form.agreePrivacy) errs.agreePrivacy = 'You must agree to the Privacy Policy.';
    return errs;
  }

  function nextStep() {
    let errs = {};
    if (step === 0) errs = validateStep0();
    if (step === 1) errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Final Submit ──────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError('');

    const fullPhone = `${form.phoneCountry}${form.phone.replace(/^0/, '')}`;
    const fullWhatsapp = form.whatsappNumber
      ? `${form.whatsappCountry}${form.whatsappNumber.replace(/^0/, '')}`
      : '';

    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: fullPhone,
          whatsappNumber: fullWhatsapp,
          agencyName: form.agencyName.trim(),
          location: form.location,
          password: form.password,
          confirmPassword: form.confirmPassword,
          profileImage: form.profileImage || null,
          agreeTerms: form.agreeTerms,
          agreePrivacy: form.agreePrivacy,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setGlobalError(json.error || 'Registration failed. Please try again.');
        return;
      }

      // Redirect to email verification page
      router.push(`/agent/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (err) {
      setGlobalError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/60">
      {/* Header */}
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-transparent.png" alt="BYD Properties" width={140} height={48} className="h-12 w-auto object-contain opacity-90" />
          </Link>
          <Link href="/agent/login" className="text-white/60 hover:text-white text-sm transition-colors">
            Already an agent? <span className="text-gold font-semibold">Sign In →</span>
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-navy text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-gold mb-4 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
            Agent Registration
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Become a BYD Properties Agent
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
            Join Rwanda&apos;s premier real estate network. List exclusive properties, connect with serious buyers, and grow your business.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress Bar */}
        <ProgressBar activeStep={0} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Header */}
          <div className="bg-cream/60 border-b border-gray-100 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                {FORM_STEPS.map((s, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      i < step ? 'bg-gold border-gold text-white' :
                      i === step ? 'bg-navy border-navy text-white' :
                      'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </span>
                    <span className={i === step ? 'text-navy font-bold' : i < step ? 'text-gold' : 'text-gray-400'}>
                      {s}
                    </span>
                    {i < FORM_STEPS.length - 1 && <span className="text-gray-200">›</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8">
            {/* Global error */}
            <AnimatePresence>
              {globalError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{globalError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STEP 0: Personal Information ─────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-navy mb-1">Personal Information</h2>
                  <p className="text-gray-400 text-sm">Tell us a bit about yourself and how clients can reach you.</p>
                </div>

                {/* Profile Photo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-navy/60 mb-2">
                    Profile Photo <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => !uploadingPhoto && photoRef.current?.click()}
                      className="w-20 h-20 rounded-xl bg-cream border-2 border-dashed border-gray-300 hover:border-gold cursor-pointer flex items-center justify-center overflow-hidden transition-all relative flex-shrink-0"
                    >
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                      ) : uploadingPhoto ? (
                        <Loader2 className="w-5 h-5 text-gold animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => !uploadingPhoto && photoRef.current?.click()}
                        className="text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? 'Uploading...' : photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      <p className="text-gray-400 text-xs mt-0.5">JPG, PNG or WebP · Max 5 MB</p>
                      <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>
                  </div>
                  {errors.photo && <FieldError msg={errors.photo} />}
                </div>

                <FormInput
                  label="Full Name"
                  icon={User}
                  required
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Your full legal name"
                  error={errors.fullName}
                />

                <FormInput
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  required
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                />

                <PhoneInput
                  label="Phone Number"
                  required
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  countryCode={form.phoneCountry}
                  onCountryCodeChange={v => set('phoneCountry', v)}
                  error={errors.phone}
                  placeholder="7XX XXX XXX"
                />

                <PhoneInput
                  label="WhatsApp Number"
                  value={form.whatsappNumber}
                  onChange={e => set('whatsappNumber', e.target.value)}
                  countryCode={form.whatsappCountry}
                  onCountryCodeChange={v => set('whatsappCountry', v)}
                  error={errors.whatsappNumber}
                  placeholder="7XX XXX XXX (optional)"
                />

                <FormInput
                  label="Agency Name"
                  icon={Building2}
                  value={form.agencyName}
                  onChange={e => set('agencyName', e.target.value)}
                  placeholder="Your agency or brokerage (optional)"
                  error={errors.agencyName}
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-navy/60 mb-1.5">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white appearance-none ${
                        errors.location ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select your location…</option>
                      {RWANDA_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError msg={errors.location} />
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Account Security ──────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-navy mb-1">Account Security</h2>
                  <p className="text-gray-400 text-sm">Create a strong password to protect your agent account.</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Your password is encrypted and stored securely. BYD Properties staff will never ask for your password.
                  </p>
                </div>

                <PasswordInput
                  label="Password"
                  required
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  error={errors.password}
                />
                <PasswordStrength password={form.password} />

                <PasswordInput
                  label="Confirm Password"
                  required
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword}
                />
              </motion.div>
            )}

            {/* ── STEP 2: Review & Submit ───────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-navy mb-1">Review & Submit</h2>
                  <p className="text-gray-400 text-sm">Please review your information before submitting.</p>
                </div>

                {/* Summary card */}
                <div className="bg-cream/60 border border-gray-100 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Application Summary</p>
                  {[
                    ['Full Name', form.fullName],
                    ['Email', form.email],
                    ['Phone', `${form.phoneCountry} ${form.phone}`],
                    form.agencyName && ['Agency', form.agencyName],
                    ['Location', form.location],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="flex items-baseline gap-3 text-sm">
                      <span className="text-gray-400 w-20 flex-shrink-0 text-xs font-semibold uppercase tracking-wider">{label}</span>
                      <span className="text-navy font-medium truncate">{val}</span>
                    </div>
                  ))}
                </div>

                {/* What happens next */}
                <div className="bg-navy/5 border border-navy/10 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-navy/50">What Happens Next</p>
                  {[
                    'We send a 6-digit verification code to your email.',
                    'You verify your email address.',
                    'An administrator reviews your application.',
                    'You receive an approval email and can log in.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-navy/70">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Legal agreements */}
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                    form.agreeTerms ? 'border-gold bg-gold/5' : errors.agreeTerms ? 'border-red-300 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={e => set('agreeTerms', e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-gold cursor-pointer"
                    />
                    <span className="text-sm text-navy/80">
                      I agree to the{' '}
                      <Link href="/terms-of-use" target="_blank" className="text-gold font-semibold hover:underline">
                        Terms and Conditions
                      </Link>{' '}
                      of BYD Properties
                    </span>
                  </label>
                  {errors.agreeTerms && <FieldError msg={errors.agreeTerms} />}

                  <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                    form.agreePrivacy ? 'border-gold bg-gold/5' : errors.agreePrivacy ? 'border-red-300 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.agreePrivacy}
                      onChange={e => set('agreePrivacy', e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-gold cursor-pointer"
                    />
                    <span className="text-sm text-navy/80">
                      I have read and agree to the{' '}
                      <Link href="/privacy-policy" target="_blank" className="text-gold font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreePrivacy && <FieldError msg={errors.agreePrivacy} />}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className={`flex gap-3 mt-8 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-navy text-sm font-semibold hover:border-navy transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < FORM_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition-all ml-auto"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold-dark transition-all ml-auto disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Submit Application</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Already have an account?{' '}
          <Link href="/agent/login" className="text-gold font-semibold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

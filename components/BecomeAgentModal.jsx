'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Building2, FileText, Camera, ChevronRight, ChevronLeft, Check, X, Star, MapPin, Globe, Briefcase, Clock, Languages } from 'lucide-react';

const STEPS = ['Personal Info', 'Professional Details', 'Profile & Submit'];

const SPECIALIZATIONS = ['Residential', 'Commercial', 'Land & Plots', 'Luxury Properties', 'Property Management', 'Construction Projects'];
const LANGUAGES = ['Kinyarwanda', 'English', 'French', 'Swahili', 'Arabic', 'Other'];
const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', '10+ years'];
const EMPLOYMENT_OPTIONS = ['Independent Agent', 'Part of an Agency', 'Full-time Employee', 'Other'];
const HOW_HEARD_OPTIONS = ['Social Media', 'Referral from a friend', 'Google Search', 'BYD Properties website', 'Event / Expo', 'Other'];

const initial = {
  // Step 1 — Personal
  fullName: '', email: '', phone: '', nationalId: '', city: '',
  // Step 2 — Professional
  experience: '', specializations: [], employment: '', agencyName: '',
  languages: [], linkedIn: '',
  // Step 3 — Profile
  bio: '', howHeard: '', password: '', photo: null,
};

function FieldError({ msg }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}

function Label({ children }) {
  return <label className="block text-[10px] uppercase tracking-[0.18em] font-black text-navy/50 mb-1.5">{children}</label>;
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-4 py-3 text-navy text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white ${error ? 'border-red-300' : 'border-gray-200'}`}
    />
  );
}

function TextArea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border px-4 py-3 text-navy text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white resize-none ${error ? 'border-red-300' : 'border-gray-200'}`}
    />
  );
}

function Select({ error, children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white ${error ? 'border-red-300' : 'border-gray-200'}`}
    >
      {children}
    </select>
  );
}

function PillToggle({ options, selected, onToggle, max = Infinity }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        const disabled = !active && selected.length >= max;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all duration-200 ${
              active ? 'bg-navy text-white border-navy' : disabled ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-navy border-gray-200 hover:border-gold hover:text-gold'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            i < step ? 'bg-gold text-white' : i === step ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-bold hidden sm:block ${i === step ? 'text-navy' : 'text-gray-400'}`}>{label}</span>
          {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-10 ${i < step ? 'bg-gold' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function BecomeAgentModal({ open, onClose }) {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function toggle(field, val) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
    }));
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set('photo', file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function validateStep(s) {
    const errs = {};
    if (s === 0) {
      if (!form.fullName.trim()) errs.fullName = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
      if (!form.phone.trim()) errs.phone = 'Required';
      if (!form.nationalId.trim()) errs.nationalId = 'Required';
      if (!form.city.trim()) errs.city = 'Required';
    }
    if (s === 1) {
      if (!form.experience) errs.experience = 'Required';
      if (form.specializations.length === 0) errs.specializations = 'Select at least one';
      if (!form.employment) errs.employment = 'Required';
    }
    if (s === 2) {
      if (!form.bio.trim() || form.bio.trim().length < 30) errs.bio = 'Please write at least 30 characters';
      if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters';
      if (!form.howHeard) errs.howHeard = 'Required';
    }
    return errs;
  }

  function next() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setError('');
    try {
      let photoUrl = null;
      if (form.photo) {
        const fd = new FormData();
        fd.append('file', form.photo);
        const r = await fetch('/api/upload?context=agent', { method: 'POST', body: fd });
        if (r.ok) photoUrl = (await r.json()).url;
      }
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          nationalId: form.nationalId,
          city: form.city,
          agencyName: form.agencyName,
          experience: form.experience,
          specialization: form.specializations.join(', '),
          languages: form.languages.join(', '),
          employment: form.employment,
          linkedIn: form.linkedIn,
          bio: form.bio,
          howHeard: form.howHeard,
          photoUrl,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(initial); setPhotoPreview(null);
    setStep(0); setSuccess(false);
    setError(''); setErrors({});
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden"
            style={{ maxHeight: '92dvh' }}
          >
            {/* Header */}
            <div className="bg-navy px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Become an Agent</h2>
                <p className="text-white/50 text-xs mt-0.5">Join Rwanda&apos;s leading real estate network</p>
              </div>
              <button onClick={handleClose} aria-label="Close" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 72px)' }}>
              {success ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-gold" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-navy mb-3">Application Submitted!</h3>
                  <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                    Thank you for applying to join our agent network. Our team will review your
                    application and contact you within 2–3 business days.
                  </p>
                  <button onClick={handleClose} className="btn-primary px-10">Done</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="px-8 py-7">
                  <StepIndicator step={step} />

                  <AnimatePresence mode="wait">
                    {/* ── STEP 1: Personal Info ──────────────────────── */}
                    {step === 0 && (
                      <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gold" />
                          <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label>Full Name *</Label>
                            <Input name="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Jean Paul Habimana" error={errors.fullName} />
                            <FieldError msg={errors.fullName} />
                          </div>
                          <div>
                            <Label>Email Address *</Label>
                            <Input name="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" error={errors.email} />
                            <FieldError msg={errors.email} />
                          </div>
                          <div>
                            <Label>Phone Number *</Label>
                            <Input name="phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 78X XXX XXX" error={errors.phone} />
                            <FieldError msg={errors.phone} />
                          </div>
                          <div>
                            <Label>National ID / Passport *</Label>
                            <Input name="nationalId" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} placeholder="ID or passport number" error={errors.nationalId} />
                            <FieldError msg={errors.nationalId} />
                          </div>
                          <div>
                            <Label>City / District *</Label>
                            <Input name="city" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Kigali, Gasabo" error={errors.city} />
                            <FieldError msg={errors.city} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 2: Professional Details ──────────────── */}
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-4 h-4 text-gold" />
                          <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Professional Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Years of Experience *</Label>
                            <Select value={form.experience} onChange={e => set('experience', e.target.value)} error={errors.experience}>
                              <option value="">Select experience</option>
                              {EXPERIENCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </Select>
                            <FieldError msg={errors.experience} />
                          </div>
                          <div>
                            <Label>Employment Type *</Label>
                            <Select value={form.employment} onChange={e => set('employment', e.target.value)} error={errors.employment}>
                              <option value="">Select type</option>
                              {EMPLOYMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </Select>
                            <FieldError msg={errors.employment} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Agency / Company Name <span className="normal-case font-normal text-gray-400">(if applicable)</span></Label>
                            <Input name="agencyName" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} placeholder="Your agency or company" />
                          </div>
                        </div>
                        <div>
                          <Label>Specializations * <span className="normal-case font-normal text-gray-400">(select all that apply)</span></Label>
                          <PillToggle options={SPECIALIZATIONS} selected={form.specializations} onToggle={v => toggle('specializations', v)} />
                          <FieldError msg={errors.specializations} />
                        </div>
                        <div>
                          <Label>Languages Spoken <span className="normal-case font-normal text-gray-400">(select all that apply)</span></Label>
                          <PillToggle options={LANGUAGES} selected={form.languages} onToggle={v => toggle('languages', v)} />
                        </div>
                        <div>
                          <Label>LinkedIn Profile <span className="normal-case font-normal text-gray-400">(optional)</span></Label>
                          <Input name="linkedIn" value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 3: Profile & Submit ───────────────────── */}
                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-gold" />
                          <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Profile & Final Details</h3>
                        </div>

                        {/* Photo */}
                        <div className="flex items-center gap-5 p-5 bg-cream/50 rounded-xl border border-gray-100">
                          <div
                            onClick={() => fileRef.current?.click()}
                            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gold/40 cursor-pointer hover:border-gold transition-colors flex-shrink-0 group"
                          >
                            {photoPreview
                              ? <Image src={photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                              : <div className="w-full h-full flex flex-col items-center justify-center bg-cream text-navy/30 group-hover:text-gold transition-colors">
                                  <Camera className="w-6 h-6 mb-1" />
                                  <span className="text-[9px] uppercase tracking-wide font-bold">Photo</span>
                                </div>
                            }
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy mb-1">Profile Photo <span className="text-gray-400 font-normal">(recommended)</span></p>
                            <p className="text-xs text-gray-400 mb-2">Professional headshot, clearly visible face</p>
                            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs border border-navy/20 px-4 py-1.5 text-navy hover:border-gold hover:text-gold transition-colors rounded-lg">
                              {photoPreview ? 'Change Photo' : 'Upload Photo'}
                            </button>
                          </div>
                          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                        </div>

                        <div>
                          <Label>Professional Bio * <span className="normal-case font-normal text-gray-400">(min. 30 characters)</span></Label>
                          <TextArea name="bio" value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} placeholder="Describe your real estate experience, your strengths, and what makes you a great agent..." error={errors.bio} />
                          <div className="flex justify-between mt-1">
                            <FieldError msg={errors.bio} />
                            <span className={`text-xs ml-auto ${form.bio.length < 30 ? 'text-gray-300' : 'text-gold'}`}>{form.bio.length} chars</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>How did you hear about us? *</Label>
                            <Select value={form.howHeard} onChange={e => set('howHeard', e.target.value)} error={errors.howHeard}>
                              <option value="">Select source</option>
                              {HOW_HEARD_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </Select>
                            <FieldError msg={errors.howHeard} />
                          </div>
                          <div>
                            <Label>Create Password *</Label>
                            <Input name="password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" error={errors.password} />
                            <FieldError msg={errors.password} />
                          </div>
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                            <X className="w-4 h-4 flex-shrink-0" /> {error}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                    {step > 0 && (
                      <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 btn-outline text-sm px-6">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                    {step < 2 ? (
                      <button type="button" onClick={next} className="btn-primary text-sm flex-1 flex items-center justify-center gap-2">
                        Continue <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button type="submit" disabled={loading} className="btn-primary text-sm flex-1 flex items-center justify-center gap-2">
                        {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><Check className="w-4 h-4" /> Submit Application</>}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

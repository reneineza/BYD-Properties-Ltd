'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  agencyName: '',
  bio: '',
  photo: null,
};

export default function BecomeAgentModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.bio.trim()) errs.bio = 'Short bio is required';
    return errs;
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setError('');

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (form.photo) {
        const fd = new FormData();
        fd.append('file', form.photo);
        const upRes = await fetch('/api/upload?context=agent', { method: 'POST', body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          photoUrl = upData.url;
        }
      }

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          agencyName: form.agencyName,
          bio: form.bio,
          photo: photoUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(initialForm);
    setPhotoPreview(null);
    setSuccess(false);
    setError('');
    setErrors({});
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="bg-navy px-8 py-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Become an Agent</h2>
                <p className="text-white/60 text-sm mt-1">
                  Join the BYD Properties network of trusted agents
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-navy mb-3">
                  Application Submitted!
                </h3>
                <p className="text-gray-500 max-w-sm mb-8">
                  Thank you for applying to join our agent network. Our team will review your
                  application and get back to you within 2–3 business days.
                </p>
                <button onClick={handleClose} className="btn-primary">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gold/40 cursor-pointer hover:border-gold transition-colors group flex-shrink-0"
                  >
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-cream text-navy/30 group-hover:text-gold transition-colors">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs">Photo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy mb-1">Profile Photo</p>
                    <p className="text-xs text-gray-400 mb-3">Upload a professional headshot (optional)</p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-xs border border-navy/20 px-4 py-2 text-navy hover:border-gold hover:text-gold transition-colors"
                    >
                      Choose Photo
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Two column fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`input-field ${errors.fullName ? 'border-red-400' : ''}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+20 100 000 0000"
                      className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Agency Name <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                    <input
                      name="agencyName"
                      value={form.agencyName}
                      onChange={handleChange}
                      placeholder="Your agency or company name"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="label">Short Bio *</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your experience in real estate and construction..."
                    className={`input-field resize-none ${errors.bio ? 'border-red-400' : ''}`}
                  />
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-outline flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

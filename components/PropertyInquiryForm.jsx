'use client';

import { useState } from 'react';

export default function PropertyInquiryForm({ propertyTitle }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I am interested in ${propertyTitle}. Please contact me with more information.`,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    
    // Auto-fill subject for property inquiry
    const payload = {
      ...form,
      subject: `Inquiry: ${propertyTitle}`,
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="font-display text-xl font-bold text-navy mb-2">Inquiry Sent!</h4>
        <p className="text-gray-500 text-sm">An agent will contact you shortly.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="font-display text-2xl font-bold text-navy mb-6">Inquire About This Property</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Your Name" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+250 788 000 000" />
        </div>
        <div>
          <label className="label">Message *</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className="w-full border border-gray-200 px-6 py-5 text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-[32px] resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Request Details'
          )}
        </button>
      </form>
    </div>
  );
}

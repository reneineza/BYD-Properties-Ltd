'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to connect to server');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 text-gold mb-2 font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
        <p className="text-white/40 text-xs">You&apos;ll be the first to know about new properties.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-4 text-white/30 hover:text-white/60 text-[10px] uppercase tracking-widest font-bold"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          className="w-full bg-white/5 border border-white/10 rounded-sm py-4 pl-5 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all duration-300"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-gold hover:bg-gold-light text-navy rounded-sm flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:hover:bg-gold"
        >
          {status === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      
      {status === 'error' && (
        <p className="mt-3 text-red-400 text-xs font-medium animate-in fade-in duration-300">
          {message}
        </p>
      )}
      
      <p className="mt-4 text-white/30 text-[10px] leading-relaxed">
        By subscribing, you agree to receive property alerts and updates. 
        You can unsubscribe at any time.
      </p>
    </div>
  );
}

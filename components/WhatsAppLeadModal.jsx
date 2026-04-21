'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function WhatsAppLeadModal({ isOpen, onClose, propertyId, propertyTitle, whatsappNumber }) {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to CRM
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          property_id: propertyId || null,
          interest: propertyTitle ? `Interested in: ${propertyTitle}` : 'General Inquiry'
        }),
      });

      // 2. Open WhatsApp
      const message = encodeURIComponent(
        propertyTitle 
          ? `Hi! My name is ${formData.name}. I'm interested in "${propertyTitle}".` 
          : `Hi! My name is ${formData.name}. I'd like to learn more about your services.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      
      // 3. Close modal
      onClose();
    } catch (err) {
      console.error('Lead capture failed:', err);
      // Still open WhatsApp even if save fails, don't block user
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="bg-navy p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-[#25D366] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Connect with an Agent</h3>
              <p className="text-white/60 text-sm">
                Enter your details to start a secure chat on WhatsApp.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +250 788..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 text-navy placeholder:text-gray-300 focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Start WhatsApp Chat
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400">
                A verified BYD Properties agent will assist you shortly.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

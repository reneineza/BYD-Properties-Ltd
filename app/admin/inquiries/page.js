'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../AdminShell';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/inquiries')
      .then((r) => r.json())
      .then((data) => {
        setInquiries([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setLoading(false);
      });
  }, []);

  async function markRead(id) {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }

  async function markResponded(id) {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true, responded: true }),
    });
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true, responded: true } : i))
    );
  }

  function openInquiry(inq) {
    setSelected(inq);
    if (!inq.read) markRead(inq.id);
  }

  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Inquiries</h1>
          <p className="text-gray-500 mt-1">
            {inquiries.length} total · {unreadCount} unread
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* List */}
          <div className="bg-white shadow-sm border border-gray-100 overflow-y-auto lg:col-span-1">
            {loading ? (
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No inquiries yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {inquiries.map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => openInquiry(inq)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                      selected?.id === inq.id ? 'bg-gold/5 border-l-2 border-gold' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !inq.read ? 'bg-gold' : 'bg-gray-200'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold truncate ${!inq.read ? 'text-navy' : 'text-gray-600'}`}>
                            {inq.name}
                          </span>
                          <time className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(inq.created_at).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {inq.subject || inq.message}
                        </p>
                        {inq.responded && (
                          <span className="text-xs text-green-600 font-medium">✓ Responded</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="bg-white shadow-sm border border-gray-100 lg:col-span-2 overflow-y-auto">
            {selected ? (
              <div className="p-8">
                <div className="flex items-start justify-between mb-8 gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-navy">{selected.name}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <a href={`mailto:${selected.email}`} className="hover:text-gold transition-colors">
                        {selected.email}
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="hover:text-gold transition-colors">
                          {selected.phone}
                        </a>
                      )}
                    </div>
                    <time className="text-xs text-gray-400 mt-1 block">
                      {new Date(selected.created_at).toLocaleString()}
                    </time>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!selected.responded && (
                      <button
                        onClick={() => {
                          markResponded(selected.id);
                          setSelected((s) => ({ ...s, read: true, responded: true }));
                        }}
                        className="text-xs btn-primary py-2 px-4"
                      >
                        Mark Responded
                      </button>
                    )}
                    {selected.responded && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-2 font-semibold">
                        ✓ Responded
                      </span>
                    )}
                  </div>
                </div>

                {selected.subject && (
                  <div className="mb-4">
                    <span className="label">Subject</span>
                    <p className="text-navy font-semibold">{selected.subject}</p>
                  </div>
                )}

                <div>
                  <span className="label">Message</span>
                  <div className="bg-cream p-6 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {selected.message}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Inquiry'}`}
                    className="btn-primary text-sm"
                  >
                    Reply via Email
                  </a>
                  {selected.phone && (
                    <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Select an inquiry to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

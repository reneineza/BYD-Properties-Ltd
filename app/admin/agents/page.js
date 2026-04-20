'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => {
        setAgents([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
      });
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (selected?.id === id) setSelected(updated);
    setUpdating(null);
  }

  async function deleteAgent(id) {
    if (!confirm('Remove this agent application?')) return;
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    setAgents((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const pendingCount = agents.filter((a) => a.status === 'pending').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy">Agent Applications</h1>
        <p className="text-gray-500 mt-1">
          {agents.length} total · {pendingCount} pending review
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
        {/* List */}
        <div className="bg-white shadow-sm border border-gray-100 overflow-y-auto lg:col-span-1">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
            </div>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No applications yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelected(agent)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                    selected?.id === agent.id ? 'bg-gold/5 border-l-2 border-gold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {agent.photo ? (
                        <img src={agent.photo} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        agent.fullName?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{agent.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 font-medium flex-shrink-0 ${STATUS_COLORS[agent.status] || ''}`}>
                      {agent.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white shadow-sm border border-gray-100 lg:col-span-2">
          {selected ? (
            <div className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {selected.photo ? (
                    <img src={selected.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selected.fullName?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-navy">{selected.fullName}</h2>
                  {selected.agencyName && (
                    <p className="text-gold text-sm font-semibold mt-0.5">{selected.agencyName}</p>
                  )}
                  <span className={`inline-block text-xs px-3 py-1 font-semibold mt-2 ${STATUS_COLORS[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <span className="label">Email</span>
                  <a href={`mailto:${selected.email}`} className="text-navy hover:text-gold transition-colors text-sm">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <p className="text-navy text-sm">{selected.phone}</p>
                </div>
                <div>
                  <span className="label">Applied On</span>
                  <p className="text-navy text-sm">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                {selected.agencyName && (
                  <div>
                    <span className="label">Agency</span>
                    <p className="text-navy text-sm">{selected.agencyName}</p>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <span className="label">Bio</span>
                <div className="bg-cream p-5 text-gray-700 text-sm leading-relaxed">
                  {selected.bio || 'No bio provided.'}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {selected.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={updating === selected.id}
                    className="btn-primary text-sm"
                  >
                    {updating === selected.id ? '...' : 'Approve'}
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'rejected')}
                    disabled={updating === selected.id}
                    className="btn-outline text-sm border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                  >
                    Reject
                  </button>
                )}
                {selected.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'pending')}
                    className="hidden"
                  />
                )}
                <a
                  href={`mailto:${selected.email}`}
                  className="btn-outline text-sm"
                >
                  Contact Agent
                </a>
                <button
                  onClick={() => deleteAgent(selected.id)}
                  className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove Application
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm min-h-[400px]">
              Select an application to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

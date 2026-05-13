'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminShell from '../AdminShell';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  active:   'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};

function Avatar({ agent, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} bg-navy rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden relative`}>
      {agent.photo_url ? (
        <Image src={agent.photo_url} alt={agent.name} fill className="object-cover" />
      ) : (
        agent.name?.[0]?.toUpperCase()
      )}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-xl rounded-sm text-sm font-medium transition-all
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Applications Tab ──────────────────────────────────────────────────────
function ApplicationsTab({ agents, loading, onAgentsChange }) {
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  async function updateStatus(id, status) {
    setUpdating(id);
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    onAgentsChange((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (selected?.id === id) setSelected(updated);
    setUpdating(null);
  }

  async function deleteAgent(id) {
    if (!confirm('Remove this agent application?')) return;
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    onAgentsChange((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const pendingCount = agents.filter((a) => a.status === 'pending').length;

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{agents.length} total · {pendingCount} pending review</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 560 }}>
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
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?.id === agent.id ? 'bg-gold/5 border-l-2 border-gold' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar agent={agent} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{agent.name}</p>
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
                <Avatar agent={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-navy">{selected.name}</h2>
                  {selected.agencyName && <p className="text-gold text-sm font-semibold mt-0.5">{selected.agencyName}</p>}
                  <span className={`inline-block text-xs px-3 py-1 font-semibold mt-2 ${STATUS_COLORS[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <span className="label">Email</span>
                  <a href={`mailto:${selected.email}`} className="text-navy hover:text-gold transition-colors text-sm">{selected.email}</a>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <p className="text-navy text-sm">{selected.phone || '—'}</p>
                </div>
                <div>
                  <span className="label">Applied On</span>
                  <time className="text-xs text-gray-400 mt-1 block">{new Date(selected.created_at).toLocaleString()}</time>
                </div>
                {selected.specialization && (
                  <div>
                    <span className="label">Specialization</span>
                    <p className="text-navy text-sm">{selected.specialization}</p>
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
                {selected.status !== 'approved' && selected.status !== 'active' && (
                  <button onClick={() => updateStatus(selected.id, 'active')} disabled={updating === selected.id} className="btn-primary text-sm">
                    {updating === selected.id ? '...' : 'Approve & Activate'}
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button onClick={() => updateStatus(selected.id, 'rejected')} disabled={updating === selected.id}
                    className="btn-outline text-sm border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500">
                    Reject
                  </button>
                )}
                <a href={`mailto:${selected.email}`} className="btn-outline text-sm">Contact Agent</a>
                <button onClick={() => deleteAgent(selected.id)} className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors">
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

// ─── Accounts Tab ──────────────────────────────────────────────────────────
function AccountsTab({ agents, loading }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Password reset state
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [toast, setToast] = useState(null);

  const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'approved');
  const filtered = activeAgents.filter((a) =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase())
  );

  function selectAgent(agent) {
    setSelected(agent);
    setEditing(false);
    setEditForm({ name: agent.name, phone: agent.phone || '', specialization: agent.specialization || '', bio: agent.bio || '' });
    setNewPw('');
    setConfirmPw('');
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  async function saveInfo() {
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setSelected(updated);
      setEditing(false);
      showToast('Agent info updated successfully.');
    } catch {
      showToast('Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (newPw !== confirmPw) { showToast('Passwords do not match.', 'error'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPw)) { showToast('Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.', 'error'); return; }
    setResetting(true);
    try {
      const res = await fetch(`/api/agents/${selected.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPw }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPw('');
        setConfirmPw('');
        showToast('Password reset successfully.');
      } else {
        showToast(data.error || 'Reset failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{activeAgents.length} active agent{activeAgents.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 560 }}>
        {/* Agent list */}
        <div className="bg-white shadow-sm border border-gray-100 flex flex-col lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-navy transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="space-y-2 p-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No active agents found.</div>
            ) : (
              filtered.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => selectAgent(agent)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?.id === agent.id ? 'bg-gold/5 border-l-2 border-gold' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar agent={agent} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{agent.name}</p>
                      <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 font-medium flex-shrink-0 ${STATUS_COLORS[agent.status] || ''}`}>
                      {agent.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white shadow-sm border border-gray-100 lg:col-span-2 overflow-y-auto">
          {selected ? (
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-start gap-6">
                <Avatar agent={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-navy">{selected.name}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{selected.email}</p>
                  <span className={`inline-block text-xs px-3 py-1 font-semibold mt-2 ${STATUS_COLORS[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-outline text-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-2.829 0L9 13z" />
                    </svg>
                    Edit Info
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={saveInfo} disabled={saving} className="btn-primary text-sm">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-outline text-sm">Cancel</button>
                  </div>
                )}
              </div>

              {/* Info fields */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Agent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <span className="label">Full Name</span>
                    {editing ? (
                      <input className="input-field" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    ) : (
                      <p className="text-navy text-sm">{selected.name}</p>
                    )}
                  </div>
                  {/* Email (read-only) */}
                  <div>
                    <span className="label">Email Address</span>
                    <p className="text-navy text-sm">{selected.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed here.</p>
                  </div>
                  {/* Phone */}
                  <div>
                    <span className="label">Phone Number</span>
                    {editing ? (
                      <input className="input-field" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" />
                    ) : (
                      <p className="text-navy text-sm">{selected.phone || '—'}</p>
                    )}
                  </div>
                  {/* Specialization */}
                  <div>
                    <span className="label">Specialization</span>
                    {editing ? (
                      <input className="input-field" value={editForm.specialization} onChange={(e) => setEditForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Residential Sales" />
                    ) : (
                      <p className="text-navy text-sm">{selected.specialization || '—'}</p>
                    )}
                  </div>
                  {/* Joined */}
                  <div>
                    <span className="label">Joined</span>
                    <p className="text-navy text-sm">{new Date(selected.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-5">
                  <span className="label">Bio</span>
                  {editing ? (
                    <textarea
                      className="input-field resize-none"
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Agent bio..."
                    />
                  ) : (
                    <div className="bg-cream p-4 text-gray-700 text-sm leading-relaxed">
                      {selected.bio || 'No bio provided.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Password reset section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Reset Portal Password</h3>
                <p className="text-gray-400 text-xs mb-5">Set a new password for this agent&apos;s portal login.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="label">New Password</span>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        className="input-field pr-10"
                        placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special char"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors" aria-label="Toggle visibility">
                        {showNewPw ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="label">Confirm Password</span>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Re-enter password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                    />
                  </div>
                </div>

                {/* Strength indicator */}
                {newPw && (
                  <div className="mt-2 flex items-center gap-2">
                    {[...Array(4)].map((_, i) => {
                      const hasLower = /[a-z]/.test(newPw);
                      const hasUpper = /[A-Z]/.test(newPw);
                      const hasNum = /\d/.test(newPw);
                      const hasSpec = /[\W_]/.test(newPw);
                      const score = (newPw.length >= 8 ? 1 : 0) + (hasLower && hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0);
                      
                      return (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          score > i
                            ? score < 2 ? 'bg-red-400' : score < 3 ? 'bg-yellow-400' : score < 4 ? 'bg-blue-400' : 'bg-emerald-500'
                            : 'bg-gray-200'
                        }`} />
                      );
                    })}
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {(() => {
                         const score = (newPw.length >= 8 ? 1 : 0) + (/[a-z]/.test(newPw) && /[A-Z]/.test(newPw) ? 1 : 0) + (/\d/.test(newPw) ? 1 : 0) + (/[\W_]/.test(newPw) ? 1 : 0);
                         return score < 2 ? 'Weak' : score < 4 ? 'Fair' : 'Strong';
                      })()}
                    </span>
                  </div>
                )}

                <button
                  onClick={resetPassword}
                  disabled={resetting || !newPw || !confirmPw}
                  className="mt-5 btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2m8 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2" /></svg>Reset Password</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm min-h-[400px] gap-3">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Select an agent to manage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => {
        setAgents([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setLoading(false);
      });
  }, []);

  const handleAgentsChange = useCallback((updater) => setAgents(updater), []);

  const tabs = [
    { id: 'applications', label: 'Applications', count: agents.filter(a => a.status === 'pending').length },
    { id: 'accounts',     label: 'Agent Accounts', count: agents.filter(a => a.status === 'active' || a.status === 'approved').length },
  ];

  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Agent Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Review applications and manage agent portal accounts.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'applications' && (
          <ApplicationsTab agents={agents} loading={loading} onAgentsChange={handleAgentsChange} />
        )}
        {activeTab === 'accounts' && (
          <AccountsTab agents={agents} loading={loading} />
        )}
      </div>
    </AdminShell>
  );
}

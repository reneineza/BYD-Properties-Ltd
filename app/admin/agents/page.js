'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminShell from '../AdminShell';
import { Search, CheckCircle2, XCircle, ShieldAlert, Clock, Mail, Phone, MapPin, Building2, User, RefreshCcw, ChevronDown, Filter } from 'lucide-react';

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  email_pending: { label: 'Unverified Email', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  pending:       { label: 'Pending Approval', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  approved:      { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  active:        { label: 'Active', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected:      { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  suspended:     { label: 'Suspended', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Avatar({ agent, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  const photoUrl = agent.photo_url || agent.profile_image;
  return (
    <div className={`${dim} bg-navy rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden relative`}>
      {photoUrl ? (
        <Image src={photoUrl} alt={agent.name} fill className="object-cover" />
      ) : (
        (agent.name || '?')[0]?.toUpperCase()
      )}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-xl rounded-xl text-sm font-medium transition-all
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Applications Tab ───────────────────────────────────────────────────────
function ApplicationsTab({ agents, loading, onAgentsChange, onToast }) {
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const statusFilters = ['all', 'email_pending', 'pending', 'approved', 'rejected', 'suspended'];
  const filteredAgents = filterStatus === 'all' ? agents : agents.filter(a => a.status === filterStatus);
  const pendingCount = agents.filter(a => a.status === 'pending').length;

  async function updateStatus(id, status, extraData = {}) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, account_status: status, ...extraData }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Update failed');
      onAgentsChange(prev => prev.map(a => (a.id === id ? updated : a)));
      if (selected?.id === id) setSelected(updated);
      onToast(`Agent ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status === 'suspended' ? 'suspended' : 'updated'} successfully.`, 'success');
    } catch (err) {
      onToast(err.message || 'Failed to update agent.', 'error');
    } finally {
      setUpdating(null);
    }
  }

  async function resendVerification(id) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resendVerification: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onToast('Verification email sent to agent.', 'success');
    } catch (err) {
      onToast(err.message || 'Failed to resend verification.', 'error');
    } finally {
      setUpdating(null);
    }
  }

  async function deleteAgent(id) {
    if (!confirm('Permanently remove this agent application?')) return;
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    onAgentsChange(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
    onToast('Application removed.', 'success');
  }

  function handleRejectSubmit() {
    if (!selected) return;
    updateStatus(selected.id, 'rejected', { rejection_reason: rejectReason });
    setShowRejectModal(false);
    setRejectReason('');
  }

  return (
    <div>
      {/* Reject reason modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowRejectModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="font-display text-xl font-bold text-navy mb-2">Reject Application</h3>
            <p className="text-gray-400 text-sm mb-5">Provide a reason for rejecting this application. It will be included in the email sent to the agent.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Missing required credentials, service area not covered..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-navy text-sm font-semibold hover:border-navy transition-all">Cancel</button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
              >
                Reject & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="text-gray-500 text-sm flex-1">{agents.length} total · {pendingCount} pending review</p>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(sf => (
            <button
              key={sf}
              onClick={() => setFilterStatus(sf)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                filterStatus === sf ? 'bg-navy text-white border-navy' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {sf === 'all' ? 'All' : STATUS_CONFIG[sf]?.label || sf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 560 }}>
        {/* List */}
        <div className="bg-white shadow-sm border border-gray-100 overflow-y-auto lg:col-span-1 rounded-xl">
          {loading ? (
            <div className="space-y-2 p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
          ) : filteredAgents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No applications match this filter.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelected(agent)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?.id === agent.id ? 'bg-gold/5 border-l-4 border-gold' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar agent={agent} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{agent.name || agent.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white shadow-sm border border-gray-100 lg:col-span-2 rounded-xl">
          {selected ? (
            <div className="p-8 overflow-y-auto h-full">
              {/* Header */}
              <div className="flex items-start gap-6 mb-8">
                <Avatar agent={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-navy">{selected.name || selected.full_name}</h2>
                  {selected.agency_name && <p className="text-gold text-sm font-semibold mt-0.5">{selected.agency_name}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={selected.status} />
                    {selected.email_verified_at ? (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 font-semibold rounded-full bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Email Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 font-semibold rounded-full bg-gray-100 text-gray-500">
                        <Mail className="w-3 h-3" /> Email Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <span className="label">Email</span>
                  <a href={`mailto:${selected.email}`} className="text-navy hover:text-gold transition-colors text-sm">{selected.email}</a>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <p className="text-navy text-sm">{selected.phone || selected.phone_number || '—'}</p>
                </div>
                {selected.whatsapp_number && (
                  <div>
                    <span className="label">WhatsApp</span>
                    <p className="text-navy text-sm">{selected.whatsapp_number}</p>
                  </div>
                )}
                {(selected.location) && (
                  <div>
                    <span className="label">Location</span>
                    <p className="text-navy text-sm flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" />{selected.location}</p>
                  </div>
                )}
                <div>
                  <span className="label">Applied On</span>
                  <time className="text-xs text-gray-400 mt-1 block">{new Date(selected.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                </div>
                {selected.email_verified_at && (
                  <div>
                    <span className="label">Email Verified</span>
                    <time className="text-xs text-gray-400 mt-1 block">{new Date(selected.email_verified_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                )}
                {selected.approved_at && (
                  <div>
                    <span className="label">Approved On</span>
                    <time className="text-xs text-gray-400 mt-1 block">{new Date(selected.approved_at).toLocaleString()}</time>
                  </div>
                )}
                {selected.specialization && (
                  <div>
                    <span className="label">Specialization</span>
                    <p className="text-navy text-sm">{selected.specialization}</p>
                  </div>
                )}
              </div>

              {/* Rejection reason */}
              {selected.rejection_reason && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1.5">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                </div>
              )}

              {/* Bio */}
              {selected.bio && (
                <div className="mb-8">
                  <span className="label">Bio</span>
                  <div className="bg-cream p-4 rounded-xl text-gray-700 text-sm leading-relaxed mt-1">{selected.bio}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                {/* Approve */}
                {selected.status !== 'approved' && selected.status !== 'active' && selected.status !== 'suspended' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-70"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {updating === selected.id ? 'Approving…' : 'Approve Application'}
                  </button>
                )}

                {/* Reject */}
                {selected.status !== 'rejected' && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-300 text-red-500 text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-70"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}

                {/* Suspend / Reactivate */}
                {(selected.status === 'approved' || selected.status === 'active') && (
                  <button
                    onClick={() => updateStatus(selected.id, 'suspended')}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-orange-300 text-orange-600 text-sm font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-70"
                  >
                    <ShieldAlert className="w-4 h-4" /> Suspend
                  </button>
                )}
                {selected.status === 'suspended' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-70"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Reactivate Account
                  </button>
                )}

                {/* Resend verification */}
                {!selected.email_verified_at && (
                  <button
                    onClick={() => resendVerification(selected.id)}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-300 text-blue-600 text-sm font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all disabled:opacity-70"
                  >
                    <RefreshCcw className="w-4 h-4" /> Resend Verification Email
                  </button>
                )}

                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-navy text-sm font-semibold hover:border-navy transition-all">
                  <Mail className="w-4 h-4" /> Email Agent
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
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm min-h-[400px] gap-3">
              <User className="w-10 h-10 text-gray-200" />
              Select an application to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Active Accounts Tab ────────────────────────────────────────────────────
function AccountsTab({ agents, loading, onToast }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [resetting, setResetting] = useState(false);

  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'approved');
  const filtered = activeAgents.filter(a =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    (a.full_name)?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.includes(search) ||
    a.phone_number?.includes(search)
  );

  function selectAgent(agent) {
    setSelected(agent);
    setEditing(false);
    setEditForm({
      name: agent.name || agent.full_name || '',
      phone: agent.phone || agent.phone_number || '',
      specialization: agent.specialization || '',
      bio: agent.bio || '',
      location: agent.location || '',
    });
    setNewPw('');
    setConfirmPw('');
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
      onToast('Agent info updated successfully.', 'success');
    } catch {
      onToast('Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (newPw !== confirmPw) { onToast('Passwords do not match.', 'error'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPw)) {
      onToast('Password must be at least 8 chars with uppercase, lowercase, number & special character.', 'error');
      return;
    }
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
        onToast('Password reset successfully.', 'success');
      } else {
        onToast(data.error || 'Reset failed.', 'error');
      }
    } catch {
      onToast('Network error.', 'error');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-gray-500 text-sm">{activeAgents.length} active agent{activeAgents.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 560 }}>
        {/* Agent list */}
        <div className="bg-white shadow-sm border border-gray-100 flex flex-col lg:col-span-1 rounded-xl">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-navy transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="space-y-2 p-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No active agents found.</div>
            ) : filtered.map(agent => (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?.id === agent.id ? 'bg-gold/5 border-l-4 border-gold' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar agent={agent} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{agent.name || agent.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white shadow-sm border border-gray-100 lg:col-span-2 overflow-y-auto rounded-xl">
          {selected ? (
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-start gap-6">
                <Avatar agent={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-navy">{selected.name || selected.full_name}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{selected.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={selected.status} />
                    {selected.email_verified_at && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 font-semibold rounded-full bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-outline text-sm flex items-center gap-1.5">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={saveInfo} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setEditing(false)} className="btn-outline text-sm">Cancel</button>
                  </div>
                )}
              </div>

              {/* Info fields */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Agent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <span className="label">Full Name</span>
                    {editing ? (
                      <input className="input-field" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    ) : (
                      <p className="text-navy text-sm">{selected.name || selected.full_name}</p>
                    )}
                  </div>
                  <div>
                    <span className="label">Email Address</span>
                    <p className="text-navy text-sm">{selected.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <span className="label">Phone Number</span>
                    {editing ? (
                      <input className="input-field" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" />
                    ) : (
                      <p className="text-navy text-sm">{selected.phone || selected.phone_number || '—'}</p>
                    )}
                  </div>
                  <div>
                    <span className="label">WhatsApp</span>
                    <p className="text-navy text-sm">{selected.whatsapp_number || '—'}</p>
                  </div>
                  <div>
                    <span className="label">Location</span>
                    {editing ? (
                      <input className="input-field" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
                    ) : (
                      <p className="text-navy text-sm">{selected.location || '—'}</p>
                    )}
                  </div>
                  <div>
                    <span className="label">Specialization</span>
                    {editing ? (
                      <input className="input-field" value={editForm.specialization} onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Residential Sales" />
                    ) : (
                      <p className="text-navy text-sm">{selected.specialization || '—'}</p>
                    )}
                  </div>
                  {selected.agency_name && (
                    <div>
                      <span className="label">Agency</span>
                      <p className="text-navy text-sm">{selected.agency_name}</p>
                    </div>
                  )}
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
                      className="input-field resize-none mt-1"
                      rows={4}
                      value={editForm.bio}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Agent bio…"
                    />
                  ) : (
                    <p className="text-navy text-sm mt-1 bg-cream/60 rounded-xl px-4 py-3 leading-relaxed">{selected.bio || '—'}</p>
                  )}
                </div>
              </div>

              {/* Password reset */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Reset Password (Admin)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        placeholder="New password…"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                      >
                        {showNewPw ? '👁' : '🔒'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat password…"
                      className="input-field"
                    />
                  </div>
                </div>
                <button
                  onClick={resetPassword}
                  disabled={resetting || !newPw || !confirmPw}
                  className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition-all disabled:opacity-50"
                >
                  {resetting ? 'Resetting…' : '🔑 Reset Password'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm min-h-[400px] gap-3">
              <User className="w-10 h-10 text-gray-200" />
              Select an agent to manage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAgents([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAgentsChange = useCallback(updater => setAgents(updater), []);
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const tabs = [
    { id: 'applications', label: 'Applications', count: agents.filter(a => a.status === 'pending' || a.status === 'email_pending').length },
    { id: 'accounts', label: 'Agent Accounts', count: agents.filter(a => a.status === 'active' || a.status === 'approved').length },
  ];

  // Stats
  const stats = [
    { label: 'Total Applications', value: agents.length, color: 'text-navy', bg: 'bg-navy/5' },
    { label: 'Pending Review', value: agents.filter(a => a.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Email Unverified', value: agents.filter(a => a.status === 'email_pending' || !a.email_verified_at).length, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Active Agents', value: agents.filter(a => a.status === 'active' || a.status === 'approved').length, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <AdminShell>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Agent Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Review applications and manage agent portal accounts.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'
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
          <ApplicationsTab agents={agents} loading={loading} onAgentsChange={handleAgentsChange} onToast={showToast} />
        )}
        {activeTab === 'accounts' && (
          <AccountsTab agents={agents} loading={loading} onToast={showToast} />
        )}
      </div>
    </AdminShell>
  );
}

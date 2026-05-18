'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HardHat, Plus, Pencil, Trash2, Star, CheckCircle2, ExternalLink } from 'lucide-react';
import AdminShell from '../AdminShell';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  async function fetchProjects() {
    const res = await fetch('/api/properties?status=under-construction');
    const data = await res.json();
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  async function toggleFeatured(project) {
    const updated = await fetch(`/api/properties/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !project.featured }),
    }).then((r) => r.json());
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function toggleApproval(project) {
    const updated = await fetch(`/api/properties/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !project.is_approved }),
    }).then((r) => r.json());
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <AdminShell>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-orange-500 flex items-center justify-center flex-shrink-0">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-navy">Construction Projects</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1 ml-12">
              {projects.length} active project{projects.length !== 1 ? 's' : ''} · shown on{' '}
              <Link href="/projects" target="_blank" className="text-gold hover:underline inline-flex items-center gap-1">
                /projects <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>
          <Link href="/admin/projects/new" className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-100 px-5 py-4 rounded-xl text-sm text-orange-700">
          <HardHat className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            These are all properties with status <strong>Under Construction</strong>. 
            They appear publicly on the <strong>/projects</strong> page. You can also manage them from the{' '}
            <Link href="/admin/properties" className="underline font-medium">Properties</Link> section.
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-28 bg-cream/30 rounded-2xl border border-dashed border-navy/10">
            <HardHat className="w-16 h-16 text-navy/10 mx-auto mb-5" />
            <h3 className="font-display text-2xl font-bold text-navy mb-3">No projects yet</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
              Add your first construction project and it will appear on the public projects page.
            </p>
            <Link href="/admin/projects/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Project</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Type</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Agent</th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Featured</th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Published</th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy truncate max-w-xs">{p.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.location}</div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="inline-block text-xs uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs font-medium text-navy">{p.agents?.name || 'Unassigned'}</span>
                      {!p.is_approved && (
                        <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 font-bold uppercase rounded">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                          p.featured ? 'bg-gold text-white' : 'bg-gray-100 text-gray-400 hover:bg-gold/20'
                        }`}
                        title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleApproval(p)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                          p.is_approved ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title={p.is_approved ? 'Click to unpublish' : 'Click to publish'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          className="flex items-center gap-1.5 text-xs font-medium text-navy border border-navy/20 px-3 py-1.5 hover:border-navy transition-colors rounded"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 hover:border-red-400 transition-colors disabled:opacity-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleting === p.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

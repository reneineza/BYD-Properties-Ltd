'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  async function fetchProperties() {
    const res = await fetch('/api/properties');
    const data = await res.json();
    setProperties(data);
    setLoading(false);
  }

  useEffect(() => { fetchProperties(); }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  async function toggleApproval(property) {
    const updated = await fetch(`/api/properties/${property.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !property.is_approved }),
    }).then((r) => r.json());
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function toggleFeatured(property) {
    const updated = await fetch(`/api/properties/${property.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !property.featured }),
    }).then((r) => r.json());
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Properties</h1>
          <p className="text-gray-500 mt-1">{properties.length} total</p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary text-sm">
          + Add Property
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-semibold mb-2">No properties yet</p>
          <Link href="/admin/properties/new" className="text-gold hover:underline">Add your first property</Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Property</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Type</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Status</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Agent</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Featured</th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((p) => (
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
                    <span className="inline-block text-xs uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-1">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={`inline-block text-xs uppercase tracking-wide px-2 py-1 ${
                      p.status === 'for-sale' ? 'bg-gold/15 text-gold-dark' : 'bg-navy/10 text-navy'
                     }`}>
                      {p.status?.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-sm font-medium text-navy">
                    {p.currency} {p.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="text-xs font-medium text-navy">{p.agents?.name || 'Unassigned'}</div>
                    {!p.is_approved && (
                      <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 font-bold uppercase">Pending</span>
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
                      ★
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!p.is_approved && (
                        <button
                          onClick={() => toggleApproval(p)}
                          className="text-xs font-bold text-white bg-green-600 px-3 py-1.5 hover:bg-green-700 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      <Link
                        href={`/admin/properties/${p.id}/edit`}
                        className="text-xs font-medium text-navy border border-navy/20 px-3 py-1.5 hover:border-navy transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deleting === p.id}
                        className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 hover:border-red-400 transition-colors disabled:opacity-50"
                      >
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
  );
}

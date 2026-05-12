'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function AgentPropertiesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  async function fetchProperties() {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/properties?agent_id=${session.user.id}`);
    const data = await res.json();
    setProperties(data);
    setLoading(false);
  }

  useEffect(() => { 
    if (session) fetchProperties(); 
  }, [session]);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Error deleting property: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">My Properties</h1>
          <p className="text-gray-500 mt-1">{properties.length} total</p>
        </div>
        <Link href="/agent/properties/new" className="btn-primary text-sm">
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
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-lg font-semibold mb-2">No properties yet</p>
          <Link href="/agent/properties/new" className="text-gold hover:underline">Submit your first property for review</Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Property</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Type</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Status</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Approval</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
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
                    <p className="font-bold text-navy truncate max-w-[200px] md:max-w-xs" title={p.title}>{p.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{p.location}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-gray-600 capitalize">
                    {p.type}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                      {p.status.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {p.is_approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/agent/properties/${p.id}/edit`}
                        className="text-gold hover:text-gold-light font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deleting === p.id}
                        className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
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

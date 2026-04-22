'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const defaultValues = {
  title: '',
  type: 'residential',
  status: 'for-sale',
  price: '',
  currency: 'RWF',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  description: '',
  youtubeUrl: '',
  featured: false,
  images: [],
  agent_id: '',
};

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function PropertyForm({ initialValues, propertyId }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [imagePreviews, setImagePreviews] = useState(initialValues?.images || []);
  const [agents, setAgents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => setAgents(data.filter(a => a.status === 'active')));
  }, []);

  const isEdit = !!propertyId;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    const uploaded = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload?context=admin', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        uploaded.push(data.url);
      }
    }

    setImagePreviews((prev) => [...prev, ...uploaded]);
    setForm((f) => ({ ...f, images: [...(f.images || []), ...uploaded] }));
    setUploading(false);
  }

  function removeImage(url) {
    setImagePreviews((prev) => prev.filter((u) => u !== url));
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: form.title,
      type: form.type,
      status: form.status,
      price: Number(form.price),
      currency: form.currency,
      location: form.location,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      description: form.description,
      youtubeUrl: form.youtubeUrl || null,
      featured: form.featured,
      images: form.images,
      agent_id: form.agent_id || null,
    };

    try {
      const url = isEdit ? `/api/properties/${propertyId}` : '/api/properties';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to save';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use status text or generic message
          errorMessage = `Error ${res.status}: ${res.statusText || 'Server Error'}`;
        }
        throw new Error(errorMessage);
      }
      router.push('/admin/properties');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100">
          Basic Information
        </h2>
        <div className="space-y-5">
          <div>
            <label className="label">Property Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Luxury Villa in Palm Hills"
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input-field">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land Plots</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="under-construction">Under Construction</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="input-field">
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="JPY">JPY (Japanese Yen)</option>
                <option value="CAD">CAD (Canadian Dollar)</option>
                <option value="AUD">AUD (Australian Dollar)</option>
                <option value="CHF">CHF (Swiss Franc)</option>
                <option value="CNY">CNY (Chinese Yuan)</option>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="ZAR">ZAR (South African Rand)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Price *</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="4500000"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kicukiro, Kigali"
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Assigned Agent</label>
            <select 
              name="agent_id" 
              value={form.agent_id || ''} 
              onChange={handleChange} 
              className="input-field"
            >
              <option value="">No Agent (Admin Only)</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-2">
              The assigned agent will be able to see and manage this property in their portal.
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100">
          Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="label">Bedrooms</label>
            <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} placeholder="0" className="input-field" />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} placeholder="0" className="input-field" />
          </div>
          <div>
            <label className="label">Area (m²)</label>
            <input name="area" type="number" min="0" value={form.area} onChange={handleChange} placeholder="0" className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the property..."
            className="input-field resize-none"
          />
        </div>
        <div className="mt-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-5 h-5 accent-gold"
            />
            <span className="text-sm font-semibold text-navy">Feature this property on the homepage</span>
          </label>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <label className="label">Property Video (YouTube URL)</label>
          <input
            name="youtubeUrl"
            value={form.youtubeUrl || ''}
            onChange={handleChange}
            placeholder="e.g. https://www.youtube.com/watch?v=..."
            className="input-field"
          />
          {getYouTubeId(form.youtubeUrl) && (
            <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-gray-200">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(form.youtubeUrl)}`}
                title="YouTube Video Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100">
          Property Images
        </h2>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-gold transition-colors p-10 text-center cursor-pointer group"
        >
          <svg className="w-10 h-10 text-gray-300 group-hover:text-gold transition-colors mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 group-hover:text-navy transition-colors">
            {uploading ? 'Uploading...' : 'Click to upload images (multiple allowed)'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="hidden"
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-5">
            {imagePreviews.map((url) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <Image 
                  src={url} 
                  alt="Property preview" 
                  fill 
                  className="object-cover" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Property'
          ) : (
            'Create Property'
          )}
        </button>
      </div>
    </form>
  );
}

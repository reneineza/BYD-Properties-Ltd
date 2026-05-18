'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2, HardHat, CalendarClock, MapPin, Layers } from 'lucide-react';

const defaultValues = {
  title: '',
  type: 'residential',
  location: '',
  completion_date: '',
  area: '',
  description: '',
  youtube_url: '',
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

export default function ProjectForm({ initialValues, projectId, returnUrl = '/admin/projects' }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [imagePreviews, setImagePreviews] = useState(initialValues?.images || []);
  const [agents, setAgents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const isEdit = !!projectId;

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => setAgents(data.filter(a => a.status === 'active')));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const compressImage = (file) => new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX_DIM = 1920;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
          else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.92);
      };
      img.src = url;
    });

    const uploadedUrls = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    const uploadFile = (file) => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const overallProgress = ((completedFiles * 100) + (event.loaded / event.total) * 100) / totalFiles;
          setUploadProgress(Math.round(overallProgress));
        }
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            completedFiles++;
            setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
            resolve(JSON.parse(xhr.responseText).url);
          } else {
            let msg = 'Upload failed';
            try { msg = JSON.parse(xhr.responseText)?.error || msg; } catch {}
            reject(new Error(msg));
          }
        }
      };
      xhr.open('POST', '/api/upload?context=admin', true);
      xhr.send(formData);
    });

    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        const url = await uploadFile(compressed);
        uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        setImagePreviews(prev => [...(prev || []), ...uploadedUrls]);
        setForm(f => ({ ...f, images: [...(f.images || []), ...uploadedUrls] }));
      }
    } catch (err) {
      setError(err.message || 'Some images failed to upload.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function removeImage(url) {
    setImagePreviews(prev => (prev || []).filter(u => u !== url));
    setForm(f => ({ ...f, images: (f.images || []).filter(u => u !== url) }));
  }

  function moveImage(index, direction) {
    const newImages = [...form.images];
    const newPreviews = [...imagePreviews];
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
    [newPreviews[index], newPreviews[target]] = [newPreviews[target], newPreviews[index]];
    setForm(f => ({ ...f, images: newImages }));
    setImagePreviews(newPreviews);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Projects are always "under-construction"; price is not applicable
    const payload = {
      title: form.title,
      type: form.type,
      status: 'under-construction',
      price: 0,
      currency: 'RWF',
      location: form.location,
      bedrooms: 0,
      bathrooms: 0,
      area: Number(form.area) || 0,
      description: form.description,
      youtube_url: form.youtube_url || null,
      featured: form.featured,
      images: form.images,
      agent_id: form.agent_id || null,
      // Store completion date in the description prefix or a dedicated field if available
      completion_date: form.completion_date || null,
    };

    try {
      const url = isEdit ? `/api/properties/${projectId}` : '/api/properties';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = 'Failed to save';
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Basic Info ───────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
          <HardHat className="w-5 h-5 text-orange-500" />
          Project Information
        </h2>
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className="label">Project Name *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Kigali Heights Residences"
              className="input-field"
              required
            />
          </div>

          {/* Type + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Project Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input-field">
                <option value="residential">Residential</option>
                <option value="apartment">Apartment Building</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land Development</option>
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold" /> Location *</label>
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

          {/* Completion Date + Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5 text-gold" /> Expected Completion
              </label>
              <input
                name="completion_date"
                value={form.completion_date || ''}
                onChange={handleChange}
                placeholder="e.g. Q4 2025 or December 2025"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Total Area (m²)</label>
              <input
                name="area"
                type="number"
                min="0"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className="input-field"
              />
            </div>
          </div>

          {/* Agent */}
          <div>
            <label className="label">Assigned Agent</label>
            <select name="agent_id" value={form.agent_id || ''} onChange={handleChange} className="input-field">
              <option value="">No Agent (Admin Only)</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Description & Media ──────────────────────────────────── */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100">
          Description &amp; Media
        </h2>
        <div className="space-y-5">
          <div>
            <label className="label">Project Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the project — what makes it special, what's planned, key highlights..."
              className="input-field resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-5 h-5 accent-gold"
            />
            <span className="text-sm font-semibold text-navy">Feature this project on the homepage</span>
          </label>

          <div className="pt-4 border-t border-gray-100">
            <label className="label">Project Video (YouTube URL)</label>
            <input
              name="youtube_url"
              value={form.youtube_url || ''}
              onChange={handleChange}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="input-field"
            />
            {getYouTubeId(form.youtube_url) && (
              <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-gray-200">
                <iframe
                  width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeId(form.youtube_url)}`}
                  title="YouTube Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Images ──────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="font-display font-bold text-navy text-lg mb-6 pb-4 border-b border-gray-100">
          Project Images
        </h2>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-gold transition-colors p-10 text-center cursor-pointer group"
        >
          <svg className="w-10 h-10 text-gray-300 group-hover:text-gold transition-colors mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 group-hover:text-navy transition-colors">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                Uploading {uploadProgress}%
              </span>
            ) : 'Click to upload images (renders, site photos, plans…)'}
          </p>
          {uploading && (
            <div className="w-64 mx-auto mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
            {imagePreviews.map((url, index) => (
              <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <Image src={url} alt="Project preview" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeImage(url)}
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                      title="Remove image">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2">
                    {index > 0 && (
                      <button type="button" onClick={() => moveImage(index, -1)}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-navy rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Move left">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {index < imagePreviews.length - 1 && (
                      <button type="button" onClick={() => moveImage(index, 1)}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-navy rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        title="Move right">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 backdrop-blur-sm text-navy text-[10px] font-bold rounded border border-navy/10 shadow-sm">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={() => router.back()} className="btn-outline flex-1">
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
          ) : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}

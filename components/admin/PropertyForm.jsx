'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Building, ChevronLeft, ChevronRight, Loader2, Copy, Layers } from 'lucide-react';

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
  youtube_url: '',
  featured: false,
  images: [],
  agent_id: '',
  price_rent: '',
  units: [],
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchSpecs, setBatchSpecs] = useState({ count: 5, bedrooms: '', bathrooms: '', price: '', labelPrefix: 'Unit ' });
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
    setUploadProgress(0);

    const uploadedUrls = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    const uploadFile = (file) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // This is progress for ONE file. 
            // We want to calculate overall progress.
            const fileProgress = (event.loaded / event.total) * 100;
            const overallProgress = ((completedFiles * 100) + fileProgress) / totalFiles;
            setUploadProgress(Math.round(overallProgress));
          }
        });

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              completedFiles++;
              setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
              resolve(response.url);
            } else {
              reject(new Error('Upload failed'));
            }
          }
        };

        xhr.open('POST', '/api/upload?context=admin', true);
        xhr.send(formData);
      });
    };

    try {
      for (const file of files) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setImagePreviews((prev) => [...(prev || []), ...uploadedUrls]);
        setForm((f) => ({
          ...f,
          images: [...(f.images || []), ...uploadedUrls]
        }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Some images failed to upload. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function removeImage(url) {
    setImagePreviews((prev) => (prev || []).filter((u) => u !== url));
    setForm((f) => ({ 
      ...f, 
      images: (f.images || []).filter((u) => u !== url) 
    }));
  }

  function moveImage(index, direction) {
    const newImages = [...form.images];
    const newPreviews = [...imagePreviews];
    
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    [newPreviews[index], newPreviews[targetIndex]] = [newPreviews[targetIndex], newPreviews[index]];

    setForm(f => ({ ...f, images: newImages }));
    setImagePreviews(newPreviews);
  }

  function addUnit() {
    setForm(f => ({
      ...f,
      units: [
        ...(f.units || []),
        { id: Date.now().toString(), label: '', bedrooms: '', bathrooms: '', price: '', status: 'available' }
      ]
    }));
  }

  function removeUnit(id) {
    setForm(f => ({
      ...f,
      units: f.units.filter(u => u.id !== id)
    }));
  }

  function updateUnit(id, field, value) {
    setForm(f => ({
      ...f,
      units: f.units.map(u => u.id === id ? { ...u, [field]: value } : u)
    }));
  }

  function duplicateUnit(unit) {
    setForm(f => ({
      ...f,
      units: [
        ...(f.units || []),
        { ...unit, id: Date.now().toString() + Math.random(), label: `${unit.label} (Copy)` }
      ]
    }));
  }

  function handleBatchAdd() {
    const newUnits = [];
    const startNum = (form.units?.length || 0) + 1;
    for (let i = 0; i < batchSpecs.count; i++) {
      newUnits.push({
        id: (Date.now() + i).toString() + Math.random(),
        label: `${batchSpecs.labelPrefix}${startNum + i}`,
        bedrooms: batchSpecs.bedrooms,
        bathrooms: batchSpecs.bathrooms,
        price: batchSpecs.price,
        status: 'available'
      });
    }
    setForm(f => ({ ...f, units: [...(f.units || []), ...newUnits] }));
    setShowBatchAdd(false);
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
      youtube_url: form.youtube_url || null,
      featured: form.featured,
      images: form.images,
      agent_id: form.agent_id || null,
      price_rent: form.price_rent ? Number(form.price_rent) : null,
      units: form.type === 'apartment' ? form.units : [],
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
                <option value="apartment">Apartment Building</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land Plots</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="for-sale-and-rent">For Sale & Rent</option>
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
            {(form.status === 'for-rent' || form.status === 'for-sale-and-rent') && (
              <div>
                <label className="label">Rent Price (Monthly)</label>
                <input
                  name="price_rent"
                  type="number"
                  value={form.price_rent}
                  onChange={handleChange}
                  placeholder="2500"
                  className="input-field"
                />
              </div>
            )}
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
            name="youtube_url"
            value={form.youtube_url || ''}
            onChange={handleChange}
            placeholder="e.g. https://www.youtube.com/watch?v=..."
            className="input-field"
          />
          {getYouTubeId(form.youtube_url) && (
            <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-gray-200">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(form.youtube_url)}`}
                title="YouTube Video Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Unit Management (Only for Apartment type) */}
      {form.type === 'apartment' && (
        <div className="bg-white shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-navy text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-gold" />
              Units Management
            </h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowBatchAdd(!showBatchAdd)}
                className="flex items-center gap-2 text-sm font-bold text-navy hover:text-gold transition-colors"
              >
                <Layers className="w-4 h-4" />
                Batch Add
              </button>
              <button
                type="button"
                onClick={addUnit}
                className="flex items-center gap-2 text-sm font-bold text-gold hover:text-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Unit
              </button>
            </div>
          </div>

          {showBatchAdd && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                Quick Batch Addition
                <span className="text-[10px] font-normal text-gray-400 font-sans uppercase tracking-wider">(Add multiple identical units)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={batchSpecs.count}
                    onChange={(e) => setBatchSpecs({ ...batchSpecs, count: parseInt(e.target.value) || 1 })}
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Label Prefix</label>
                  <input
                    value={batchSpecs.labelPrefix}
                    onChange={(e) => setBatchSpecs({ ...batchSpecs, labelPrefix: e.target.value })}
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Beds</label>
                  <input
                    type="number"
                    value={batchSpecs.bedrooms}
                    onChange={(e) => setBatchSpecs({ ...batchSpecs, bedrooms: e.target.value })}
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Baths</label>
                  <input
                    type="number"
                    value={batchSpecs.bathrooms}
                    onChange={(e) => setBatchSpecs({ ...batchSpecs, bathrooms: e.target.value })}
                    className="input-field py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Price</label>
                  <input
                    type="number"
                    value={batchSpecs.price}
                    onChange={(e) => setBatchSpecs({ ...batchSpecs, price: e.target.value })}
                    className="input-field py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchAdd(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchAdd}
                  className="px-6 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-gold transition-all shadow-md active:scale-95"
                >
                  Create {batchSpecs.count} Units
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(!form.units || form.units.length === 0) ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No units added yet. Click &quot;Add New Unit&quot; to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                      <th className="pb-3 pl-2">Unit Label</th>
                      <th className="pb-3">Beds</th>
                      <th className="pb-3">Baths</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {form.units.map((unit) => (
                      <tr key={unit.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-3 pl-2">
                          <input
                            value={unit.label}
                            onChange={(e) => updateUnit(unit.id, 'label', e.target.value)}
                            placeholder="e.g. Apt 101"
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-navy p-0"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={unit.bedrooms}
                            onChange={(e) => updateUnit(unit.id, 'bedrooms', e.target.value)}
                            placeholder="0"
                            className="w-12 bg-transparent border-none focus:ring-0 text-sm text-navy p-0"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={unit.bathrooms}
                            onChange={(e) => updateUnit(unit.id, 'bathrooms', e.target.value)}
                            placeholder="0"
                            className="w-12 bg-transparent border-none focus:ring-0 text-sm text-navy p-0"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={unit.price}
                            onChange={(e) => updateUnit(unit.id, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-24 bg-transparent border-none focus:ring-0 text-sm text-gold font-bold p-0"
                          />
                        </td>
                        <td className="py-3">
                          <select
                            value={unit.status}
                            onChange={(e) => updateUnit(unit.id, 'status', e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase tracking-wider text-navy p-0"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="sold">Sold</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex justify-end items-center gap-3">
                            <button
                              type="button"
                              onClick={() => duplicateUnit(unit)}
                              className="text-gray-300 hover:text-gold transition-colors"
                              title="Duplicate unit"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeUnit(unit.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete unit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic">
            Note: Units will only be saved if the property type is set to &quot;Apartment Building&quot;.
          </p>
        </div>
      )}

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
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                Uploading {uploadProgress}%
              </span>
            ) : 'Click to upload images (multiple allowed)'}
          </p>
          {uploading && (
            <div className="w-64 mx-auto mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
            {imagePreviews.map((url, index) => (
              <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <Image 
                  src={url} 
                  alt="Property preview" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-navy rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                        title="Move left"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {index < imagePreviews.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-navy rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                        title="Move right"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Index Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 backdrop-blur-sm text-navy text-[10px] font-bold rounded border border-navy/10 shadow-sm">
                  #{index + 1}
                </div>
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

'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CheckCircle2, Home, Info, PhoneCall, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { key: 'home', label: 'Homepage', icon: Home },
  { key: 'about', label: 'About Page', icon: Info },
  { key: 'contact', label: 'Contact Page', icon: PhoneCall },
];

const FIELDS = {
  home: [
    { name: 'heroTitle', label: 'Hero Title', type: 'textarea', rows: 2 },
    { name: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea', rows: 2 },
    { name: 'heroCtaText', label: 'Hero CTA Button Text', type: 'text' },
    { name: 'statsYears', label: 'Stat: Years', type: 'text' },
    { name: 'statsProjects', label: 'Stat: Projects', type: 'text' },
    { name: 'statsClients', label: 'Stat: Clients', type: 'text' },
    { name: 'statsAwards', label: 'Stat: Awards', type: 'text' },
    { name: 'featuredTitle', label: 'Featured Section Title', type: 'text' },
    { name: 'featuredSubtitle', label: 'Featured Section Subtitle', type: 'text' },
  ],
  about: [
    { name: 'title', label: 'Page Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'story', label: 'Our Story', type: 'textarea', rows: 10 },
    { name: 'mission', label: 'Mission Statement', type: 'textarea', rows: 3 },
    { name: 'vision', label: 'Vision Statement', type: 'textarea', rows: 3 },
    {
      name: 'stats',
      label: 'Performance Stats',
      type: 'array',
      schema: [
        { name: 'num', label: 'Number (e.g. 14+)', type: 'text' },
        { name: 'label', label: 'Label (e.g. Years)', type: 'text' },
      ],
      defaultItem: { num: '', label: '' }
    },
    {
      name: 'team',
      label: 'Team Members',
      type: 'array',
      schema: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'role', label: 'Role', type: 'text' },
        { name: 'initials', label: 'Initials', type: 'text' },
        { name: 'bio', label: 'Bio (shown on card flip)', type: 'textarea', rows: 3 },
        { name: 'image', label: 'Profile Photo', type: 'image' },
      ],
      defaultItem: { name: '', role: '', initials: '', bio: '', image: '' }
    },
    {
      name: 'values',
      label: 'Core Values',
      type: 'array',
      schema: [
        { name: 'title', label: 'Value Title', type: 'text' },
        { name: 'desc', label: 'Description', type: 'textarea', rows: 2 },
      ],
      defaultItem: { title: '', desc: '' }
    }
  ],
  contact: [
    { name: 'address', label: 'Office Address', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'email', label: 'Email Address', type: 'text' },
    { name: 'whatsapp', label: 'WhatsApp Number (digits only)', type: 'text' },
    { name: 'workingHours', label: 'Working Hours', type: 'text' },
  ],
};

export default function AdminContentPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => { setContent(data); setLoading(false); });
  }, []);

  function handleChange(field, value) {
    setContent((c) => ({
      ...c,
      [activeSection]: { ...c[activeSection], [field]: value },
    }));
  }

  function handleArrayChange(arrayField, index, subField, value) {
    setContent((c) => {
      const sectionData = c[activeSection] || {};
      const arrData = [...(sectionData[arrayField] || [])];
      arrData[index] = { ...arrData[index], [subField]: value };
      return {
        ...c,
        [activeSection]: { ...sectionData, [arrayField]: arrData },
      };
    });
  }

  async function handleImageUpload(arrayField, index, subField, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const res = await fetch('/api/upload?context=admin', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        handleArrayChange(arrayField, index, subField, data.url);
      }
    } catch (e) {
      console.error("Upload failed", e);
    }
  }

  function addArrayItem(arrayField, defaultItem) {
    setContent((c) => {
      const sectionData = c[activeSection] || {};
      const arrData = [...(sectionData[arrayField] || []), { ...defaultItem }];
      return {
        ...c,
        [activeSection]: { ...sectionData, [arrayField]: arrData },
      };
    });
  }

  function removeArrayItem(arrayField, index) {
    setContent((c) => {
      const sectionData = c[activeSection] || {};
      const arrData = [...(sectionData[arrayField] || [])];
      arrData.splice(index, 1);
      return {
        ...c,
        [activeSection]: { ...sectionData, [arrayField]: arrData },
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const sectionData = content[activeSection] || {};
  const fields = FIELDS[activeSection] || [];

  return (
    <div className="relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 font-medium"
          >
            <CheckCircle2 size={20} />
            Content saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Content Management</h1>
          <p className="text-gray-500 mt-1">Manage all the text, imagery, and lists on your website.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 py-3 px-6 shadow-md hover:shadow-lg transition-all"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Section Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'border-gold bg-gold/5 text-gold'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-navy'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-gold' : 'text-gray-400'} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            <h2 className="font-display font-bold text-navy text-2xl mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
              {SECTIONS.find((s) => s.key === activeSection)?.label} Content
            </h2>
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {fields.map((field) => {
                  if (field.type === 'array') {
                    const arrData = sectionData[field.name] || [];
                    return (
                      <div key={field.name} className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <label className="text-xl font-display font-bold text-navy">{field.label}</label>
                            <p className="text-sm text-gray-500 mt-1">Manage the list of items for this section.</p>
                          </div>
                          <button
                            onClick={() => addArrayItem(field.name, field.defaultItem)}
                            className="bg-navy hover:bg-navy/90 text-white transition-colors flex items-center gap-2 py-2 px-4 rounded text-sm font-medium"
                          >
                            <Plus size={16} /> Add Item
                          </button>
                        </div>
                        <div className="space-y-4">
                          {arrData.map((item, index) => (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={index}
                              className="bg-gray-50 p-6 rounded-xl relative group border border-gray-200"
                            >
                              <button
                                onClick={() => removeArrayItem(field.name, index)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-8">
                                {field.schema.map(subField => (
                                  <div key={subField.name} className={subField.type === 'textarea' ? 'md:col-span-2' : ''}>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                      {subField.label}
                                    </label>
                                    {subField.type === 'textarea' ? (
                                      <textarea
                                        value={item[subField.name] || ''}
                                        onChange={(e) => handleArrayChange(field.name, index, subField.name, e.target.value)}
                                        rows={subField.rows || 2}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none resize-none text-sm shadow-sm"
                                      />
                                    ) : subField.type === 'image' ? (
                                      <div className="flex items-center gap-4">
                                        {item[subField.name] && (
                                          <img src={item[subField.name]} alt="preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                        )}
                                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm transition-colors">
                                          <Upload size={16} />
                                          {item[subField.name] ? 'Change Photo' : 'Upload Photo'}
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => handleImageUpload(field.name, index, subField.name, e.target.files[0])}
                                          />
                                        </label>
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        value={item[subField.name] || ''}
                                        onChange={(e) => handleArrayChange(field.name, index, subField.name, e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none text-sm shadow-sm"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                          {arrData.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                              <p className="text-sm text-gray-500">No items added yet. Click &quot;Add Item&quot; to start.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <label className="text-sm font-bold text-navy mb-2 block">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={sectionData[field.name] || ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          rows={field.rows || 3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold focus:border-gold outline-none resize-none text-sm transition-all"
                        />
                      ) : (
                        <input
                          type="text"
                          value={sectionData[field.name] || ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gold focus:border-gold outline-none text-sm transition-all"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

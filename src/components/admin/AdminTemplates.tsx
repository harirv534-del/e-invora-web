import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Sparkles, Check, X } from 'lucide-react';
import { EventCategory, Template } from '../../types';
import { api } from '../../lib/api';

interface AdminTemplatesProps {
  categories: EventCategory[];
  onPreviewTemplate: (slug: string) => void;
}

export const AdminTemplates: React.FC<AdminTemplatesProps> = ({ categories, onPreviewTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState('');
  const [formThumb, setFormThumb] = useState('');
  const [formHero, setFormHero] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formAttributes, setFormAttributes] = useState('royal, luxury');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setIsCreating(false);
    setFormName(t.name);
    setFormSlug(t.slug);
    setFormDesc(t.description);
    setFormCat(t.categoryId);
    setFormThumb(t.thumbnailUrl);
    setFormHero(t.heroImageUrl);
    setFormIsPublished(t.isPublishedInGallery);
    setFormAttributes(t.styleAttributes.join(', '));
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsCreating(true);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormCat(categories[0]?.id || 'traditional-indian-wedding');
    setFormThumb('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
    setFormHero('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80');
    setFormIsPublished(true);
    setFormAttributes('royal, floral');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const attributes = formAttributes
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (isCreating) {
        await api.createAdminTemplate({
          name: formName.trim(),
          slug: formSlug.trim().toLowerCase(),
          description: formDesc.trim(),
          categoryId: formCat,
          styleAttributes: attributes,
          thumbnailUrl: formThumb.trim(),
          heroImageUrl: formHero.trim(),
          galleryImages: [formThumb.trim(), formHero.trim()],
          themeColors: {
            primary: '#6E2639',
            accent: '#D4B477',
            background: '#F8F3EA',
            text: '#29221F',
          },
          fontFamilySerif: 'Cormorant Garamond',
          fontFamilySans: 'Plus Jakarta Sans',
          isPublishedInGallery: formIsPublished,
          isFeatured: false,
          availablePackages: ['basic', 'standard', 'premium'],
          sectionConfig: {
            hero: true,
            details: true,
            story: true,
            schedule: true,
            gallery: true,
            countdown: true,
            rsvp: true,
            map: true,
            music: true,
          },
          demoContent: {
            coupleNames: 'Dev & Natasha',
            subtitle: 'Cordially invite you to celebrate their union',
            invitationText: 'With joyful hearts, we solicit your esteemed presence.',
            date: '2026-12-20',
            time: '11:00 AM',
            venueName: 'Grand Royal Palace',
            venueAddress: 'Bengaluru, Karnataka',
          },
        });
      } else if (editingTemplate) {
        await api.updateAdminTemplate(editingTemplate.id, {
          name: formName.trim(),
          slug: formSlug.trim().toLowerCase(),
          description: formDesc.trim(),
          categoryId: formCat,
          thumbnailUrl: formThumb.trim(),
          heroImageUrl: formHero.trim(),
          isPublishedInGallery: formIsPublished,
          styleAttributes: attributes,
        });
      }

      setEditingTemplate(null);
      setIsCreating(false);
      fetchTemplates();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteAdminTemplate(id);
      fetchTemplates();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">
            Design Template Atelier
          </h2>
          <p className="text-xs text-[#F8F3EA]/70">
            Manage your gallery templates, demo preview configurations, and package capabilities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D4B477]" />
          <span>Add New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-[#231C1A] rounded-2xl border border-[#D4B477]/30 overflow-hidden flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-black/40">
                <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tpl.isPublishedInGallery
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {tpl.isPublishedInGallery ? 'In Gallery' : 'Unpublished'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[10px] font-mono text-[#D4B477]">/templates/{tpl.slug}</span>
                <h3 className="font-serif text-xl font-bold text-white">{tpl.name}</h3>
                <p className="text-xs text-[#F8F3EA]/70 line-clamp-2 leading-relaxed">{tpl.description}</p>
                <div className="pt-2 flex flex-wrap gap-1">
                  {tpl.styleAttributes.map((a) => (
                    <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#D4B477]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
              <button
                onClick={() => onPreviewTemplate(tpl.slug)}
                className="text-xs font-semibold text-[#D4B477] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Live Demo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                  title="Edit Template"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {(editingTemplate || isCreating) && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#231C1A] rounded-3xl border border-[#D4B477]/40 w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-white">
                {isCreating ? 'Create New Invitation Template' : `Edit: ${editingTemplate?.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#D4B477] font-semibold block mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#D4B477] font-semibold block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">Event Category</label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">Style Attributes (Comma-separated)</label>
                <input
                  type="text"
                  value={formAttributes}
                  onChange={(e) => setFormAttributes(e.target.value)}
                  placeholder="royal, luxury, cultural"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#D4B477] font-semibold block mb-1">Thumbnail Image URL</label>
                  <input
                    type="url"
                    required
                    value={formThumb}
                    onChange={(e) => setFormThumb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#D4B477] font-semibold block mb-1">Hero Image URL</label>
                  <input
                    type="url"
                    required
                    value={formHero}
                    onChange={(e) => setFormHero(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#6E2639]"
                  />
                  <span>Published in public gallery</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white font-bold bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

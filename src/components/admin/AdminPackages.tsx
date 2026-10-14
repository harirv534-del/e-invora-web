import React, { useState, useEffect } from 'react';
import { Package, PackageId } from '../../types';
import { api } from '../../lib/api';
import { Check, Edit3, Save, X, Sparkles } from 'lucide-react';

export const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  const [formPrice, setFormPrice] = useState(499);
  const [formDesc, setFormDesc] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formCapabilities, setFormCapabilities] = useState({
    rsvp: false,
    countdown: false,
    gallery: false,
    schedule: false,
    music: false,
    maps: true,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setFormPrice(pkg.price);
    setFormDesc(pkg.description);
    setFormFeatures(pkg.features.join('\n'));
    setFormIsActive(pkg.isActive);
    setFormCapabilities({
      rsvp: pkg.capabilities.rsvp,
      countdown: pkg.capabilities.countdown,
      gallery: pkg.capabilities.gallery,
      schedule: pkg.capabilities.schedule,
      music: pkg.capabilities.music,
      maps: pkg.capabilities.maps,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    const featuresList = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      await api.updateAdminPackage(editingPkg.id, {
        price: Number(formPrice),
        description: formDesc.trim(),
        features: featuresList,
        isActive: formIsActive,
        capabilities: {
          ...editingPkg.capabilities,
          ...formCapabilities,
        },
      });
      setEditingPkg(null);
      fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-bold text-white">
          Packages & Transparent Pricing Engine
        </h2>
        <p className="text-xs text-[#F8F3EA]/70">
          Database-driven pricing for Basic (₹499), Standard (₹799), and Premium (₹1,199). Price changes immediately validate on server bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-[#231C1A] rounded-3xl p-6 border border-[#D4B477]/35 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#D4B477]">
                    {pkg.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-[#F8F3EA]/50 tracking-wider">
                    Tier ID: {pkg.id}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(pkg)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-white">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#F8F3EA]/60 ml-1">one-time</span>
              </div>

              <p className="text-xs text-[#F8F3EA]/75 leading-relaxed mb-4">
                {pkg.description}
              </p>

              <div className="space-y-2 py-3 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#D4B477] tracking-wider block">
                  Enabled Capabilities:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={pkg.capabilities.rsvp ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • RSVP Form
                  </span>
                  <span className={pkg.capabilities.countdown ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • Live Countdown
                  </span>
                  <span className={pkg.capabilities.gallery ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • Photo Gallery
                  </span>
                  <span className={pkg.capabilities.schedule ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • Multi-Ceremony
                  </span>
                  <span className={pkg.capabilities.music ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • Music Player
                  </span>
                  <span className={pkg.capabilities.maps ? 'text-emerald-400' : 'text-gray-500 line-through'}>
                    • Maps Navigation
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#F8F3EA]/60">
              <span>Status: <strong className={pkg.isActive ? 'text-emerald-400' : 'text-rose-400'}>{pkg.isActive ? 'Active' : 'Disabled'}</strong></span>
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="text-xs font-semibold text-[#D4B477] hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Package Edit Drawer / Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#231C1A] rounded-3xl border border-[#D4B477]/40 w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-white">
                Edit Package: {editingPkg.name}
              </h3>
              <button onClick={() => setEditingPkg(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">
                  Package Price in INR (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">
                  Tier Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-[#D4B477] font-semibold block mb-1">
                  Bullet Points (One feature per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-[#D4B477] font-semibold block">
                  Toggle Enabled Interactive Capabilities:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.rsvp}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, rsvp: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Interactive RSVP</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.countdown}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, countdown: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Live Countdown</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.gallery}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, gallery: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Photo Gallery</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.schedule}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, schedule: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Multi-Ceremony</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.music}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, music: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Music Player</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCapabilities.maps}
                      onChange={(e) => setFormCapabilities({ ...formCapabilities, maps: e.target.checked })}
                      className="accent-[#6E2639]"
                    />
                    <span>Maps Integration</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="accent-[#6E2639]"
                  />
                  <span>Package is active and available for customer booking</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white font-bold bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                >
                  Save Package Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Database, ShieldCheck, Sparkles, ExternalLink, Key } from 'lucide-react';
import { AppSettings } from '../../types';
import { api } from '../../lib/api';

const CredentialsCard: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirm) {
      setMsg({ ok: false, text: 'The new passwords do not match.' });
      return;
    }
    setBusy(true);
    try {
      await api.changeAdminCredentials(currentPassword, newEmail.trim(), newPassword);
      setMsg({ ok: true, text: 'Login details changed. Other devices have been signed out.' });
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || 'Could not change login details.' });
    } finally {
      setBusy(false);
    }
  };

  const cls = 'w-full px-4 py-2.5 rounded-xl text-xs bg-[#29221F] border border-[#D4B477]/30 text-white focus:outline-none focus:border-[#D4B477]';
  return (
    <form onSubmit={submit} className="p-6 rounded-3xl bg-[#231C1A] border border-[#D4B477]/35 shadow-md space-y-4">
      <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
        <Key className="w-4 h-4 text-[#D4B477]" /> Change Owner Login
      </h3>
      <p className="text-[11px] text-[#F8F3EA]/60">
        Enter your current password to set a new login email and password. Passwords are stored only as a secure hash and can never be viewed.
      </p>
      {msg && (
        <div className={`p-3 rounded-xl text-xs ${msg.ok ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40' : 'bg-rose-950/70 text-rose-200 border border-rose-500/40'}`}>
          {msg.text}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="sm:col-span-2">
          <label className="text-[#D4B477] font-semibold block mb-1">Current password</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={cls} autoComplete="current-password" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[#D4B477] font-semibold block mb-1">New login email</label>
          <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={cls} autoComplete="username" />
        </div>
        <div>
          <label className="text-[#D4B477] font-semibold block mb-1">New password (12+ characters)</label>
          <input type="password" required minLength={12} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={cls} autoComplete="new-password" />
        </div>
        <div>
          <label className="text-[#D4B477] font-semibold block mb-1">Repeat new password</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={cls} autoComplete="new-password" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/40 cursor-pointer disabled:opacity-60">
          {busy ? 'Saving...' : 'Change Login'}
        </button>
      </div>
    </form>
  );
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');

  // Form states
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [autoAiDrafts, setAutoAiDrafts] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await api.getAdminSettings();
        setSettings(data);
        setBrandName(data.brandName);
        setTagline(data.tagline);
        setWhatsappNumber(data.whatsappNumber);
        setContactEmail(data.contactEmail);
        setPrimaryPhone(data.primaryPhone);
        setAutoAiDrafts(data.autoGenerateAiDrafts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('');
    try {
      const updated = await api.updateAdminSettings({
        brandName: brandName.trim(),
        tagline: tagline.trim(),
        whatsappNumber: whatsappNumber.trim(),
        contactEmail: contactEmail.trim(),
        primaryPhone: primaryPhone.trim(),
        autoGenerateAiDrafts: autoAiDrafts,
      });
      setSettings(updated);
      setSavedMessage('Settings successfully saved to database.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-bold text-white">
          Business Settings & Database Status
        </h2>
        <p className="text-xs text-[#F8F3EA]/70">
          Update contact details, brand details and your owner login.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Storage status (accurate) */}
      <div className="p-6 rounded-3xl bg-[#231C1A] border border-[#D4B477]/35 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Data Storage</h3>
            <p className="text-xs text-[#F8F3EA]/60">Bookings, RSVP responses and settings are saved on the server.</p>
          </div>
        </div>
        <p className="text-xs text-[#F8F3EA]/70 leading-relaxed">
          This version stores data in a private file on the machine running the server (<code>server/data/</code>).
          It is not connected to Supabase. A Supabase table setup file is included in the project for a future move,
          but nothing reads from it yet. Back up the <code>server/data</code> folder regularly.
        </p>
      </div>

      <CredentialsCard />

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#231C1A] border border-[#D4B477]/35 shadow-md space-y-6">
        {/* Brand Information */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-[#D4B477] border-b border-white/10 pb-2">
            Brand Identity & Tagline
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#D4B477] font-semibold block mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-[#D4B477] font-semibold block mb-1">Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Concierge & WhatsApp */}
        <div className="space-y-4 pt-2">
          <h4 className="font-serif text-lg font-bold text-[#D4B477] border-b border-white/10 pb-2">
            Concierge Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#D4B477] font-semibold block mb-1">WhatsApp Business Number</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 87780 95016"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-[#D4B477] font-semibold block mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-[#D4B477] font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="+91 87780 95016"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>


        {/* AI Automation Policy */}
        <div className="space-y-4 pt-2">
          <h4 className="font-serif text-lg font-bold text-[#D4B477] border-b border-white/10 pb-2">
            Private AI Copywriting Workflow
          </h4>
          <label className="flex items-start gap-3 cursor-pointer text-xs text-[#F8F3EA]/90">
            <input
              type="checkbox"
              checked={autoAiDrafts}
              onChange={(e) => setAutoAiDrafts(e.target.checked)}
              className="w-4 h-4 rounded accent-[#6E2639] mt-0.5"
            />
            <div>
              <span className="font-semibold text-white block">
                Automatically generate private AI draft when new booking is received
              </span>
              <span className="text-[#F8F3EA]/60 text-[11px]">
                Uses server-side Gemini API with high-thinking mode. Drafts are kept strictly private inside the Owner Admin panel for review.
              </span>
            </div>
          </label>
        </div>

        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/40 shadow-md cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#D4B477]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

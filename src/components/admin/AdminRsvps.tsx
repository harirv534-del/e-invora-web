import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, Users, UserCheck, UserX } from 'lucide-react';
import { api } from '../../lib/api';
import { RsvpResponse } from '../../types';

export const AdminRsvps: React.FC = () => {
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [slug, setSlug] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setRsvps(await api.getAdminRsvps());
    } catch (e: any) {
      setError(e.message || 'Could not load RSVP responses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const slugs = useMemo(() => Array.from(new Set(rsvps.map((r) => r.invitationSlug))), [rsvps]);
  const visible = slug === 'all' ? rsvps : rsvps.filter((r) => r.invitationSlug === slug);
  const yes = visible.filter((r) => r.attending === 'yes');
  const no = visible.filter((r) => r.attending === 'no');
  const guests = yes.reduce((n, r) => n + r.guestCount, 0);

  const remove = async (id: string) => {
    if (!window.confirm('Delete this response?')) return;
    try {
      await api.deleteAdminRsvp(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#29221F]">RSVP Responses</h1>
        <p className="text-xs text-[#29221F]/60 mt-1">
          Guest replies from live invitations (Standard and Royal Premium). Only you can see this page.
        </p>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D4B477]/30 flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          <div><p className="text-2xl font-serif font-bold">{yes.length}</p><p className="text-[11px] text-[#29221F]/60">Attending</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#D4B477]/30 flex items-center gap-3">
          <Users className="w-6 h-6 text-[#6E2639]" />
          <div><p className="text-2xl font-serif font-bold">{guests}</p><p className="text-[11px] text-[#29221F]/60">Total guests coming</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#D4B477]/30 flex items-center gap-3">
          <UserX className="w-6 h-6 text-rose-600" />
          <div><p className="text-2xl font-serif font-bold">{no.length}</p><p className="text-[11px] text-[#29221F]/60">Not attending</p></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold" htmlFor="rsvp-filter">Invitation:</label>
        <select
          id="rsvp-filter"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-white border border-[#D4B477]/40"
        >
          <option value="all">All invitations</option>
          {slugs.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4B477]/30 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-xs text-[#29221F]/60">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-xs text-[#29221F]/60">No responses yet. They appear here when guests reply on a live invitation.</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F3EA] text-[#29221F]/70">
              <tr>
                <th className="p-3">Guest</th><th className="p-3">Reply</th><th className="p-3">Guests</th>
                <th className="p-3">Message</th><th className="p-3">Invitation</th><th className="p-3">Received</th><th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-[#D4B477]/20">
                  <td className="p-3 font-semibold">{r.guestName}</td>
                  <td className="p-3">
                    <span className={r.attending === 'yes' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {r.attending === 'yes' ? 'Attending' : 'Not attending'}
                    </span>
                  </td>
                  <td className="p-3">{r.attending === 'yes' ? r.guestCount : '-'}</td>
                  <td className="p-3 max-w-xs break-words">{r.message || '-'}</td>
                  <td className="p-3">{r.invitationSlug}</td>
                  <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <button onClick={() => remove(r.id)} aria-label="Delete response" className="text-rose-600 hover:text-rose-800 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

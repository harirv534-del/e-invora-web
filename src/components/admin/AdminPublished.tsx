import React, { useState, useEffect } from 'react';
import { Globe, ExternalLink, ShieldCheck, PowerOff, RefreshCw } from 'lucide-react';
import { PublishedInvitation } from '../../types';
import { api } from '../../lib/api';

export const AdminPublished: React.FC = () => {
  const [publishedList, setPublishedList] = useState<PublishedInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublished = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPublished();
      setPublishedList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublished();
  }, []);

  const handleUnpublish = async (id: string) => {
    if (!confirm('Unpublish this invitation website from the public internet?')) return;
    try {
      await api.unpublishInvitation(id);
      fetchPublished();
    } catch (err: any) {
      alert(err.message || 'Failed to unpublish');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">
            Published Invitation Websites
          </h2>
          <p className="text-xs text-[#F8F3EA]/70">
            Immutable customer website snapshots hosted at dedicated URLs (/invite/:slug). Never exposes internal notes or customer contact numbers.
          </p>
        </div>

        <button
          onClick={fetchPublished}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4B477] cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#231C1A] rounded-3xl border border-[#D4B477]/30 shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-[#F8F3EA]/60">Loading published websites...</div>
        ) : publishedList.length === 0 ? (
          <div className="text-center py-16 text-xs text-[#F8F3EA]/60 space-y-2">
            <Globe className="w-8 h-8 text-[#D4B477] mx-auto opacity-40" />
            <p>No invitations published yet.</p>
            <p className="text-[11px] text-[#F8F3EA]/40">
              When a booking is verified and approved, publish it from the Booking Enquiries tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#D4B477] uppercase text-[10px] tracking-wider bg-black/20">
                  <th className="py-3.5 px-4">Celebrant Names</th>
                  <th className="py-3.5 px-4">Web URL Path</th>
                  <th className="py-3.5 px-4">Package Tier</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Published At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {publishedList.map((item) => {
                  const celebrants = item.snapshotContent.booking.celebrantNames;
                  const eventDate = item.snapshotContent.booking.eventDate;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {celebrants}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#D4B477]">
                        /invite/{item.slug}
                      </td>
                      <td className="py-3.5 px-4 capitalize font-medium text-[#F8F3EA]/80">
                        {item.packageId}
                      </td>
                      <td className="py-3.5 px-4 text-[#F8F3EA]/70">
                        {eventDate}
                      </td>
                      <td className="py-3.5 px-4 text-[#F8F3EA]/60">
                        {new Date(item.publishedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {item.isActive ? 'Active Live' : 'Unpublished'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/invite/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/30 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3 text-[#D4B477]" />
                          </a>
                          {item.isActive && (
                            <button
                              onClick={() => handleUnpublish(item.id)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 cursor-pointer"
                              title="Unpublish"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

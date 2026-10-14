import React, { useState, useEffect } from 'react';
import {
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Globe,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { Booking } from '../../types';
import { api } from '../../lib/api';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onSelectBooking: (bookingId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onSelectBooking,
}) => {
  const [metrics, setMetrics] = useState<any>({
    totalEnquiries: 0,
    newBookings: 0,
    pendingReview: 0,
    awaitingCustomerConfirmation: 0,
    paymentPending: 0,
    paymentVerified: 0,
    readyToPublish: 0,
    publishedInvitations: 0,
    aiDraftsReady: 0,
    aiGenerationFailures: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [m, b] = await Promise.all([
          api.getAdminMetrics(),
          api.getAdminBookings(),
        ]);
        setMetrics(m);
        setRecentBookings(b.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metricCards = [
    {
      label: 'Total Enquiries',
      val: metrics.totalEnquiries,
      icon: <Inbox className="w-5 h-5 text-[#D4B477]" />,
      bg: 'bg-white/5 border-white/10',
      actionTab: 'bookings',
    },
    {
      label: 'New Bookings',
      val: metrics.newBookings,
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-950/20 border-amber-500/30',
      actionTab: 'bookings',
      highlight: true,
    },
    {
      label: 'Pending Review',
      val: metrics.pendingReview,
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-950/20 border-blue-500/30',
      actionTab: 'bookings',
    },
    {
      label: 'Awaiting Customer Conf.',
      val: metrics.awaitingCustomerConfirmation,
      icon: <MessageCircle className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-950/20 border-purple-500/30',
      actionTab: 'bookings',
    },
    {
      label: 'Payment Pending',
      val: metrics.paymentPending,
      icon: <CreditCard className="w-5 h-5 text-orange-400" />,
      bg: 'bg-orange-950/20 border-orange-500/30',
      actionTab: 'payments',
    },
    {
      label: 'Payment Verified',
      val: metrics.paymentVerified,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-950/20 border-emerald-500/30',
      actionTab: 'payments',
    },
    {
      label: 'AI Drafts Ready',
      val: metrics.aiDraftsReady,
      icon: <Sparkles className="w-5 h-5 text-[#D4B477]" />,
      bg: 'bg-[#6E2639]/30 border-[#D4B477]/30',
      actionTab: 'ai-drafts',
    },
    {
      label: 'Ready to Publish',
      val: metrics.readyToPublish,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-300" />,
      bg: 'bg-emerald-950/30 border-emerald-400/40',
      actionTab: 'bookings',
      highlight: true,
    },
    {
      label: 'Published Websites',
      val: metrics.publishedInvitations,
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-950/20 border-cyan-500/30',
      actionTab: 'published',
    },
    {
      label: 'AI Generation Failures',
      val: metrics.aiGenerationFailures,
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-950/20 border-rose-500/30',
      actionTab: 'ai-drafts',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#29221F] via-[#3D1A23] to-[#29221F] rounded-3xl p-6 sm:p-8 border border-[#D4B477]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#6E2639] text-[#D4B477] border border-[#D4B477]/30">
              Owner Overview
            </span>
            <span className="text-xs text-[#D4B477] font-semibold">Live Business Operations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            E-INVORA Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#F8F3EA]/70 max-w-2xl font-sans">
            Manage your client enquiries, coordinate manual payment confirmations, review private AI drafts, and publish live invitation websites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('bookings')}
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/40 shadow-sm transition-all cursor-pointer"
          >
            Manage Bookings
          </button>
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4B477]" />
            <span>Operational Key Metrics</span>
          </h2>
          <span className="text-xs text-[#F8F3EA]/50">Real-time database counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {metricCards.map((card, i) => (
            <button
              key={i}
              onClick={() => onNavigateTab(card.actionTab)}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-black/30">{card.icon}</span>
                {card.highlight && card.val > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-white block">
                  {card.val}
                </span>
                <span className="text-[11px] font-medium text-[#F8F3EA]/70 line-clamp-1 mt-0.5">
                  {card.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-[#231C1A] rounded-3xl p-6 border border-[#D4B477]/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">
              Recent Customer Enquiries
            </h3>
            <p className="text-xs text-[#F8F3EA]/60">Latest submissions awaiting owner review</p>
          </div>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-semibold text-[#D4B477] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Enquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-10 text-[#F8F3EA]/50 text-xs">
            No booking enquiries recorded yet. Submissions from the public booking form will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#D4B477] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Celebrants</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Package</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#D4B477] font-semibold">
                      {b.reference}
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      {b.celebrantNames}
                    </td>
                    <td className="py-3 px-3 text-[#F8F3EA]/80">
                      {b.customerName}
                    </td>
                    <td className="py-3 px-3 text-[#F8F3EA]/60">
                      {b.eventDate}
                    </td>
                    <td className="py-3 px-3 text-[#F8F3EA]/80">
                      <span className="capitalize">{b.packageId}</span> (₹{b.agreedPrice})
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/10 text-white border border-white/10">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectBooking(b.id);
                          onNavigateTab('bookings');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-[#D4B477] bg-white/5 hover:bg-white/10 border border-[#D4B477]/30 cursor-pointer"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

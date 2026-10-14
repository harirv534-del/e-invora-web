import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MessageCircle,
  Phone,
  Eye,
  Sparkles,
  CreditCard,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Calendar,
  MapPin,
  X,
  FileText,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { Booking, BookingStatus, Payment, AiDraft, PublishedInvitation, Template } from '../../types';
import { api } from '../../lib/api';

interface AdminBookingsProps {
  initialSelectedBookingId?: string;
  onClearInitialBooking?: () => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  initialSelectedBookingId,
  onClearInitialBooking,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedAiDraft, setSelectedAiDraft] = useState<AiDraft | null>(null);
  const [selectedPublished, setSelectedPublished] = useState<PublishedInvitation | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal tabs
  const [activeTab, setActiveTab] = useState<'details' | 'ai-draft' | 'payment' | 'publish'>('details');

  // Contact history logger form
  const [contactChannel, setContactChannel] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [contactNote, setContactNote] = useState('');

  // Internal notes editor
  const [internalNotes, setInternalNotes] = useState('');

  // Manual payment verification fields
  const [paymentTxRef, setPaymentTxRef] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<any>('pending');
  const [paymentMethod, setPaymentMethod] = useState<any>('Direct');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Publishing custom slug
  const [customSlug, setCustomSlug] = useState('');

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminBookings(statusFilter, searchQuery);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  // Open initial booking if provided
  useEffect(() => {
    if (initialSelectedBookingId) {
      openBookingDetails(initialSelectedBookingId);
      if (onClearInitialBooking) onClearInitialBooking();
    }
  }, [initialSelectedBookingId]);

  const openBookingDetails = async (id: string) => {
    try {
      setActionMessage('');
      const data = await api.getAdminBookingDetails(id);
      setSelectedBooking(data.booking);
      setSelectedPayment(data.payment);
      setSelectedAiDraft(data.aiDraft || null);
      setSelectedPublished(data.published || null);
      setInternalNotes(data.booking.internalNotes || '');
      if (data.payment) {
        setPaymentTxRef(data.payment.transactionReference || '');
        setPaymentStatus(data.payment.status);
        setPaymentMethod(data.payment.paymentMethod);
        setVerificationNotes(data.payment.verificationNotes || '');
      }
      setCustomSlug(
        data.published?.slug ||
          data.booking.celebrantNames.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
            '-' +
            new Date(data.booking.eventDate).getFullYear()
      );
    } catch (err: any) {
      alert(err.message || 'Failed to open booking details');
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      const updated = await api.updateAdminBooking(selectedBooking.id, { status: newStatus });
      setSelectedBooking(updated);
      fetchBookings();
      setActionMessage(`Status successfully updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      const updated = await api.updateAdminBooking(selectedBooking.id, { internalNotes });
      setSelectedBooking(updated);
      fetchBookings();
      setActionMessage('Internal notes saved.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddContactLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !contactNote.trim()) return;
    try {
      setActionLoading(true);
      const updated = await api.addContactLog(selectedBooking.id, contactChannel, contactNote.trim());
      setSelectedBooking(updated);
      setContactNote('');
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !selectedPayment) return;
    try {
      setActionLoading(true);
      const updatedPayment = await api.updateAdminPayment(selectedPayment.id, {
        transactionReference: paymentTxRef.trim(),
        status: paymentStatus,
        paymentMethod,
        verificationNotes: verificationNotes.trim(),
        verifiedAt: paymentStatus === 'verified' ? new Date().toISOString() : undefined,
      });
      setSelectedPayment(updatedPayment);
      openBookingDetails(selectedBooking.id);
      fetchBookings();
      setActionMessage(`Payment recorded as ${paymentStatus}.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerAiDraft = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      setActionMessage('Triggering Gemini AI with high-thinking reasoning...');
      const draft = await api.generateAiDraft(selectedBooking.id);
      setSelectedAiDraft(draft);
      setActionMessage('AI draft successfully generated! Review below.');
      setActiveTab('ai-draft');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'AI generation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      const published = await api.publishInvitation(selectedBooking.id, customSlug.trim());
      setSelectedPublished(published);
      openBookingDetails(selectedBooking.id);
      fetchBookings();
      setActionMessage(`Invitation successfully published at /invite/${published.slug}`);
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedPublished) return;
    try {
      setActionLoading(true);
      await api.unpublishInvitation(selectedPublished.id);
      if (selectedBooking) openBookingDetails(selectedBooking.id);
      fetchBookings();
      setActionMessage('Invitation unpublished from public view.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#231C1A] p-4 rounded-2xl border border-[#D4B477]/25">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#D4B477] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference, customer name, phone, celebrants..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#1A1615] border border-white/10 text-white focus:outline-none focus:border-[#D4B477]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#D4B477] shrink-0" />
          {[
            { id: 'all', label: 'All' },
            { id: 'new', label: 'New' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'awaiting_confirmation', label: 'Awaiting Conf.' },
            { id: 'payment_pending', label: 'Pay Pending' },
            { id: 'payment_verified', label: 'Pay Verified' },
            { id: 'ready_to_publish', label: 'Ready to Pub' },
            { id: 'published', label: 'Published' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-[#6E2639] text-white border border-[#D4B477]/40'
                  : 'bg-white/5 text-[#F8F3EA]/70 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#231C1A] rounded-3xl border border-[#D4B477]/30 shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-[#F8F3EA]/60">Loading enquiries...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-xs text-[#F8F3EA]/60">
            No bookings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#D4B477] uppercase text-[10px] tracking-wider bg-black/20">
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Celebrant Names</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">WhatsApp Phone</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Agreed Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#D4B477]">
                      {b.reference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {b.celebrantNames}
                    </td>
                    <td className="py-3.5 px-4 text-[#F8F3EA]/80">
                      {b.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#F8F3EA]/80">
                      <a
                        href={`https://wa.me/${b.whatsappPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{b.whatsappPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-[#F8F3EA]/60">
                      {b.eventDate}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-[#F8F3EA]/80">
                      {b.packageId}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-white">
                      ₹{b.agreedPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/10 text-white border border-white/10">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openBookingDetails(b.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/30 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==============================================================================
          BOOKING DETAILS & WORKFLOW MODAL
      ============================================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#231C1A] rounded-3xl border border-[#D4B477]/40 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D4B477]/25 flex items-start justify-between bg-black/30">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-[#D4B477] bg-black/40 px-3 py-1 rounded-lg border border-[#D4B477]/30">
                    {selectedBooking.reference}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6E2639] text-white">
                    {selectedBooking.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mt-2">
                  {selectedBooking.celebrantNames}
                </h3>
                <p className="text-xs text-[#F8F3EA]/70">
                  Booked by {selectedBooking.customerName} on {new Date(selectedBooking.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#F8F3EA]/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Navigation Tabs */}
            <div className="flex border-b border-white/10 px-6 bg-black/20 gap-2 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'details', label: '1. Event & Contacts', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'ai-draft', label: '2. Private AI Draft', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'payment', label: '3. Payment Verification', icon: <CreditCard className="w-3.5 h-3.5" /> },
                { id: 'publish', label: '4. Publish Invitation', icon: <Globe className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#D4B477] text-[#D4B477]'
                      : 'border-transparent text-[#F8F3EA]/60 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {actionMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {/* TAB 1: DETAILS & CONTACTS */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Quick Action Status Changer */}
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#D4B477]">Booking Workflow Status:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'new',
                        'under_review',
                        'awaiting_confirmation',
                        'payment_pending',
                        'payment_verified',
                        'ready_to_publish',
                        'published',
                        'rejected',
                      ].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st as BookingStatus)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            selectedBooking.status === st
                              ? 'bg-[#6E2639] text-white border border-[#D4B477]/50 shadow-xs'
                              : 'bg-white/5 text-[#F8F3EA]/60 hover:bg-white/10'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info & 1-Click WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-3">
                      <h4 className="font-serif font-bold text-sm text-[#D4B477]">
                        Client Contact Details
                      </h4>
                      <div className="space-y-1.5 text-xs text-[#F8F3EA]/80">
                        <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
                        <p><strong>Primary Phone:</strong> {selectedBooking.primaryPhone}</p>
                        <p><strong>WhatsApp:</strong> {selectedBooking.whatsappPhone}</p>
                        <p><strong>Preferred Language:</strong> {selectedBooking.preferredLanguage}</p>
                      </div>

                      {/* WhatsApp 1-Click Link */}
                      <a
                        href={`https://wa.me/${selectedBooking.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${selectedBooking.customerName}! This is the E-INVORA design team regarding your celebration invitation booking (${selectedBooking.reference}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 transition-colors w-full justify-center"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Chat on WhatsApp Directly</span>
                      </a>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-3">
                      <h4 className="font-serif font-bold text-sm text-[#D4B477]">
                        Event & Venue Overview
                      </h4>
                      <div className="space-y-1.5 text-xs text-[#F8F3EA]/80">
                        <p><strong>Event Date:</strong> {selectedBooking.eventDate}</p>
                        <p><strong>Timing:</strong> {selectedBooking.eventTime || 'Not specified'}</p>
                        <p><strong>Venue:</strong> {selectedBooking.venueName}</p>
                        <p className="line-clamp-2"><strong>Address:</strong> {selectedBooking.venueAddress}</p>
                        {selectedBooking.googleMapsUrl && (
                          <a
                            href={selectedBooking.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:underline block"
                          >
                            Open Google Maps Link ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package & Agreed Price Snapshot */}
                  <div className="p-4 rounded-2xl bg-[#6E2639]/20 border border-[#D4B477]/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D4B477] tracking-wider">
                        Package & Financial Snapshot
                      </span>
                      <h4 className="font-serif text-lg font-bold text-white capitalize">
                        {selectedBooking.packageId} Package Tier
                      </h4>
                      <p className="text-xs text-[#F8F3EA]/70">
                        Agreed price snapshot permanently locked in database.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl font-bold text-[#D4B477]">
                        ₹{selectedBooking.agreedPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#F8F3EA]/50 block">One-time fee</span>
                    </div>
                  </div>

                  {/* Customer Uploaded Photos */}
                  {selectedBooking.uploadedPhotoUrls && selectedBooking.uploadedPhotoUrls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-sm text-[#D4B477]">
                        Client Uploaded Photos ({selectedBooking.uploadedPhotoUrls.length})
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedBooking.uploadedPhotoUrls.map((url, i) => (
                          <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border border-white/20">
                            <img src={url} alt="Client upload" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Special Notes */}
                  {selectedBooking.additionalRequirements && (
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-1">
                      <span className="text-[10px] font-semibold text-[#D4B477] uppercase">
                        Customer Additional Requirements / Shloka Notes:
                      </span>
                      <p className="text-xs text-[#F8F3EA]/80 font-sans">
                        {selectedBooking.additionalRequirements}
                      </p>
                    </div>
                  )}

                  {/* Internal Notes Editor */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-xs font-semibold text-[#D4B477] block">
                      Internal Team Notes (Private to Owner):
                    </label>
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add private operational notes here..."
                      className="w-full px-4 py-2 rounded-xl text-xs bg-black/30 border border-white/10 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveInternalNotes}
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                    >
                      Save Internal Notes
                    </button>
                  </div>

                  {/* Contact History Log */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="font-serif font-bold text-sm text-[#D4B477]">
                      Client Interaction & Contact History
                    </h4>

                    <form onSubmit={handleAddContactLog} className="flex gap-2">
                      <select
                        value={contactChannel}
                        onChange={(e) => setContactChannel(e.target.value as any)}
                        className="px-3 py-2 rounded-xl text-xs bg-black/30 border border-white/10 text-white"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Email">Email</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={contactNote}
                        onChange={(e) => setContactNote(e.target.value)}
                        placeholder="Log note (e.g. Discussed font preferences with client on WhatsApp)"
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-black/30 border border-white/10 text-white"
                      />
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D4B477] text-[#29221F] hover:bg-[#EBD8A9] cursor-pointer"
                      >
                        Log Note
                      </button>
                    </form>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(selectedBooking.contactHistory || []).map((item) => (
                        <div key={item.id} className="p-2.5 rounded-xl bg-black/20 text-xs border border-white/5 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold text-[#D4B477] mr-2">[{item.channel}]</span>
                            <span className="text-[#F8F3EA]/80">{item.note}</span>
                          </div>
                          <span className="text-[10px] text-[#F8F3EA]/40 shrink-0">
                            {new Date(item.timestamp).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRIVATE AI DRAFTS ATELIER */}
              {activeTab === 'ai-draft' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#D4B477]">
                        Private AI-Assisted Copywriting
                      </h4>
                      <p className="text-xs text-[#F8F3EA]/70">
                        Generates authentic, auspicious wording and poetry tailored to customer details.
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerAiDraft}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4B477]" />
                      <span>{selectedAiDraft ? 'Regenerate AI Draft' : 'Generate AI Draft'}</span>
                    </button>
                  </div>

                  {selectedAiDraft ? (
                    <div className="p-6 rounded-2xl bg-black/30 border border-[#D4B477]/35 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#D4B477] tracking-wider">
                            Model Used
                          </span>
                          <p className="text-xs font-mono text-white">{selectedAiDraft.modelUsed}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {selectedAiDraft.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[#D4B477] font-semibold block">Generated Title:</span>
                          <input
                            type="text"
                            value={selectedAiDraft.draftContent.title}
                            onChange={(e) =>
                              setSelectedAiDraft({
                                ...selectedAiDraft,
                                draftContent: { ...selectedAiDraft.draftContent, title: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white mt-1"
                          />
                        </div>

                        <div>
                          <span className="text-[#D4B477] font-semibold block">Subtitle / Greeting:</span>
                          <input
                            type="text"
                            value={selectedAiDraft.draftContent.subtitle}
                            onChange={(e) =>
                              setSelectedAiDraft({
                                ...selectedAiDraft,
                                draftContent: { ...selectedAiDraft.draftContent, subtitle: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white mt-1"
                          />
                        </div>

                        <div>
                          <span className="text-[#D4B477] font-semibold block">Formal Invitation Text:</span>
                          <textarea
                            rows={3}
                            value={selectedAiDraft.draftContent.formalInvitationText}
                            onChange={(e) =>
                              setSelectedAiDraft({
                                ...selectedAiDraft,
                                draftContent: { ...selectedAiDraft.draftContent, formalInvitationText: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white mt-1"
                          />
                        </div>

                        {selectedAiDraft.draftContent.welcomePoem && (
                          <div>
                            <span className="text-[#D4B477] font-semibold block">Auspicious Verse / Poem:</span>
                            <textarea
                              rows={2}
                              value={selectedAiDraft.draftContent.welcomePoem}
                              onChange={(e) =>
                                setSelectedAiDraft({
                                  ...selectedAiDraft,
                                  draftContent: { ...selectedAiDraft.draftContent, welcomePoem: e.target.value },
                                })
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white mt-1 font-serif italic"
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            await api.updateAiDraft(selectedBooking.id, {
                              draftContent: selectedAiDraft.draftContent,
                              status: 'approved',
                            });
                            setActionMessage('Draft changes approved and saved.');
                          }}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                        >
                          Approve AI Draft
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/10 space-y-3">
                      <Sparkles className="w-8 h-8 text-[#D4B477] mx-auto" />
                      <p className="font-serif text-lg text-white">No AI Draft Generated Yet</p>
                      <p className="text-xs text-[#F8F3EA]/60 max-w-sm mx-auto">
                        Click the button above to generate customized, high-thinking invitation wording based on customer inputs.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENT VERIFICATION */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#D4B477]">
                      Manual Payment Record Verification
                    </h4>
                    <p className="text-xs text-[#F8F3EA]/70">
                      Record payment transaction ID, method, and verify client payment before publishing.
                    </p>
                  </div>

                  <form onSubmit={handleUpdatePayment} className="p-6 rounded-2xl bg-black/30 border border-[#D4B477]/30 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                          Expected Amount (Agreed Snapshot)
                        </label>
                        <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-serif font-bold text-base">
                          ₹{selectedBooking.agreedPrice.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                          Payment Verification Status
                        </label>
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="verified">Verified (Approved)</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white"
                        >
                          <option value="Direct">Direct / Offline Confirmation</option>
                          <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                          <option value="Card">Card</option>
                          <option value="Cash">Cash</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                          Transaction Reference / Receipt / UTR
                        </label>
                        <input
                          type="text"
                          value={paymentTxRef}
                          onChange={(e) => setPaymentTxRef(e.target.value)}
                          placeholder="e.g. Bank Ref / IMPS UTR / Receipt No."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                          Internal Verification Notes
                        </label>
                        <textarea
                          rows={2}
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="e.g. Verified in HDFC Bank statement at 11:30 AM"
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                    >
                      Update Payment Status
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: PUBLISHING */}
              {activeTab === 'publish' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#D4B477]">
                      Publishing Workflow & Live URL
                    </h4>
                    <p className="text-xs text-[#F8F3EA]/70">
                      Publishes an immutable snapshot of approved content. Private customer data is never exposed.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/30 border border-[#D4B477]/35 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#D4B477] block mb-1">
                        Unique Shareable Web URL Slug:
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#F8F3EA]/60 font-mono">https://e-invora.com/invite/</span>
                        <input
                          type="text"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    {selectedPublished && selectedPublished.isActive ? (
                      <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> Live on Public Internet
                          </span>
                          <span className="text-[10px] text-[#F8F3EA]/60">
                            Published: {new Date(selectedPublished.publishedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <a
                          href={`/invite/${selectedPublished.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#D4B477] font-semibold underline"
                        >
                          <span>Open Live Website: /invite/{selectedPublished.slug}</span>
                          <Globe className="w-3.5 h-3.5" />
                        </a>

                        <div className="pt-2 flex gap-3">
                          <button
                            onClick={handleUnpublish}
                            disabled={actionLoading}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 cursor-pointer"
                          >
                            Unpublish Invitation
                          </button>
                          <button
                            onClick={handlePublish}
                            disabled={actionLoading}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#6E2639] hover:bg-[#8E364C] cursor-pointer"
                          >
                            Republish Fresh Snapshot
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={handlePublish}
                          disabled={actionLoading}
                          className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-600 shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Publish Live to /invite/{customSlug}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

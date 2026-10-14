import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  ExternalLink,
  Sparkles,
  Send,
  Check,
  Calendar,
} from 'lucide-react';
import { PublishedInvitation } from '../../types';
import { api } from '../../lib/api';

interface PublicInvitationViewProps {
  slug: string;
  onGoHome: () => void;
}

export const PublicInvitationView: React.FC<PublicInvitationViewProps> = ({ slug, onGoHome }) => {
  const [invitation, setInvitation] = useState<PublishedInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: '', attending: 'yes' as 'yes' | 'no', guests: '2', wishes: '' });
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let isMounted = true;
    async function loadPublished() {
      try {
        setLoading(true);
        const data = await api.getPublishedInvitation(slug);
        if (isMounted) {
          if (data) {
            setInvitation(data);
          } else {
            setError('This invitation website is either unpublished or does not exist.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load invitation website.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPublished();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const dateStr = invitation?.snapshotContent.booking.eventDate;
    if (!dateStr) return;
    const target = new Date(dateStr + 'T00:00:00').getTime();
    if (Number.isNaN(target)) return;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [invitation]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError('');
    setRsvpSending(true);
    try {
      await api.submitRsvp(slug, {
        guestName: rsvpData.name,
        attending: rsvpData.attending,
        guestCount: Number(rsvpData.guests),
        message: rsvpData.wishes,
      });
      setRsvpSubmitted(true); // shown only after the server confirms it was saved
    } catch (err: any) {
      setRsvpError(err.message || 'Could not save your RSVP. Please try again.');
    } finally {
      setRsvpSending(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: invitation?.snapshotContent.booking.celebrantNames || 'Celebration Invitation',
        text: 'You are cordially invited to celebrate with us! View our digital invitation website here:',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-3 border-[#6E2639] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-xl font-bold text-[#29221F]">Loading Celebration Invitation...</p>
          <p className="text-xs text-[#29221F]/60">E-INVORA Bespoke Digital Invitations</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-md border border-[#D4B477]/40 shadow-sm space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#6E2639]">Invitation Not Available</h2>
          <p className="text-xs text-[#29221F]/70 leading-relaxed font-sans">
            {error || 'This celebration website could not be found or has not been published by the host.'}
          </p>
          <button
            onClick={onGoHome}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] cursor-pointer"
          >
            Visit E-INVORA Home
          </button>
        </div>
      </div>
    );
  }

  const { snapshotContent, packageId } = invitation;
  const { template, booking, approvedCopy } = snapshotContent;
  const isBasic = packageId === 'basic';
  const isPremium = packageId === 'premium';

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#29221F] selection:bg-[#D4B477] selection:text-[#29221F]">
      {/* Top Floating Bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#D4B477]/40 text-[#6E2639] text-xs font-semibold shadow-md hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Invitation'}</span>
        </button>

        {!isBasic && (
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className="w-9 h-9 rounded-full bg-[#6E2639] text-[#D4B477] border border-[#D4B477]/50 shadow-md flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
            title={isPlayingMusic ? 'Mute' : 'Play Music'}
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center p-6 sm:p-12 overflow-hidden">
        <img
          src={template.heroImageUrl}
          alt={booking.celebrantNames}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#29221F] via-[#29221F]/30 to-black/60" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6 text-white py-12">
          <div className="inline-block p-2 border-y border-[#D4B477]/70">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4B477] font-semibold">
              {approvedCopy.title || 'Wedding Celebration'}
            </p>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide text-white drop-shadow-md">
            {booking.celebrantNames}
          </h1>

          <p className="font-serif italic text-lg sm:text-2xl text-[#F8F3EA]/90 max-w-xl mx-auto">
            {approvedCopy.subtitle || 'You are invited to celebrate with us'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs font-sans tracking-widest uppercase text-[#D4B477]">
            <span>
              {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{booking.eventTime || 'Time to be announced'}</span>
          </div>
        </div>
      </section>

      {/* Formal Text & Poem */}
      <section className="py-20 px-6 sm:px-12 text-center max-w-3xl mx-auto space-y-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#E9DFD0] flex items-center justify-center text-[#6E2639]">
          <Sparkles className="w-6 h-6 text-[#D4B477]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#6E2639]">
          A Sacred Celebration of Love
        </h2>

        {approvedCopy.welcomePoem && (
          <p className="font-serif italic text-xl text-[#29221F]/80 max-w-xl mx-auto leading-relaxed">
            “{approvedCopy.welcomePoem}”
          </p>
        )}

        <p className="text-sm sm:text-base text-[#29221F]/80 leading-relaxed font-sans max-w-2xl mx-auto">
          {approvedCopy.formalInvitationText}
        </p>
      </section>

      {/* Countdown (Standard & Premium) */}
      {!isBasic && (
        <section className="py-12 px-6 bg-[#FAF6EE] border-y border-[#D4B477]/30 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4B477]">
              Countdown
            </span>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Days', val: timeLeft.days },
                { label: 'Hours', val: timeLeft.hours },
                { label: 'Minutes', val: timeLeft.minutes },
                { label: 'Seconds', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-3 border border-[#D4B477]/30 shadow-xs">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639] block">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#29221F]/60 uppercase tracking-wider font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venue & Directions */}
      <section className="py-20 px-6 sm:px-12 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E9DFD0] flex items-center justify-center text-[#6E2639]">
            <MapPin className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F]">
            Celebration Venue
          </h2>

          <div className="p-8 rounded-3xl bg-[#F8F3EA] border border-[#D4B477]/35 space-y-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639]">
              {booking.venueName}
            </h3>
            <p className="text-sm text-[#29221F]/75 font-sans max-w-lg mx-auto">
              {booking.venueAddress}
            </p>
            {booking.eventTime && (
              <p className="text-xs text-[#D4B477] font-semibold tracking-wider uppercase pt-2">
                Timing: {booking.eventTime}
              </p>
            )}
          </div>

          <div className="pt-2">
            <a
              href={
                booking.googleMapsUrl ||
                `https://maps.google.com/?q=${encodeURIComponent(
                  `${booking.venueName}, ${booking.venueAddress}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors shadow-sm"
            >
              <MapPin className="w-4 h-4 text-[#D4B477]" />
              <span>Get GPS Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Embedded Map for Premium */}
          {isPremium && (
            <div className="mt-8 rounded-3xl overflow-hidden border-2 border-[#D4B477]/40 shadow-xs">
              <iframe
                title="Live Venue Map"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${booking.venueName}, ${booking.venueAddress}`
                )}&output=embed`}
              />
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery (Standard & Premium) */}
      {!isBasic && template.galleryImages && template.galleryImages.length > 0 && (
        <section className="py-20 px-6 sm:px-12 bg-[#FAF6EE] border-t border-[#D4B477]/30">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
              Special Moments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F]">
              Celebration Gallery
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {template.galleryImages.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden h-52 sm:h-64 border border-[#D4B477]/30 shadow-xs">
                  <img src={img} alt="Celebration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Online RSVP (Standard & Royal Premium) */}
      {!isBasic && (
        <section className="py-20 px-6 sm:px-12 bg-white border-t border-[#D4B477]/30">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#6E2639] text-[#D4B477] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
                Guest Attendance
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#29221F] mt-1">
                Kindly Confirm Your Presence
              </h2>
              {approvedCopy.rsvpMessage && (
                <p className="text-xs text-[#29221F]/70 font-sans mt-2">
                  {approvedCopy.rsvpMessage}
                </p>
              )}
            </div>

            {rsvpSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                <Check className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="font-serif text-xl font-bold">Thank You, {rsvpData.name}!</h4>
                <p className="text-xs">Your reply has been saved. The hosts can now see it.</p>
              </div>
            ) : (
              <form
                onSubmit={handleRsvpSubmit}
                className="p-6 rounded-3xl bg-[#F8F3EA] border border-[#D4B477]/40 space-y-4 text-left"
              >
                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                    placeholder="Enter guest or family name"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                <fieldset>
                  <legend className="text-xs font-semibold text-[#29221F] mb-1">Will you attend?</legend>
                  <div className="flex gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="attending" checked={rsvpData.attending === 'yes'} onChange={() => setRsvpData({ ...rsvpData, attending: 'yes' })} /> Yes, I will come
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="attending" checked={rsvpData.attending === 'no'} onChange={() => setRsvpData({ ...rsvpData, attending: 'no' })} /> Sorry, I cannot
                    </label>
                  </div>
                </fieldset>

                {rsvpData.attending === 'yes' && (
                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={rsvpData.guests}
                    onChange={(e) => setRsvpData({ ...rsvpData, guests: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n} {n === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={rsvpData.wishes}
                    onChange={(e) => setRsvpData({ ...rsvpData, wishes: e.target.value })}
                    placeholder="Write a short message..."
                    className="w-full px-4 py-2 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                {rsvpError && (
                  <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">{rsvpError}</p>
                )}
                <button
                  type="submit"
                  disabled={rsvpSending}
                  className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {rsvpSending ? 'Sending...' : 'Send RSVP'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <footer className="py-12 bg-[#29221F] text-[#F8F3EA] text-center space-y-3 border-t border-[#D4B477]/40">
        <p className="font-serif text-2xl font-bold tracking-widest text-[#D4B477]">
          E-INVORA
        </p>
        <p className="text-xs text-[#F8F3EA]/60 font-serif italic">
          “Every Celebration Deserves a Beautiful Invitation.”
        </p>
        <div className="pt-2">
          <button
            onClick={onGoHome}
            className="text-[11px] text-[#D4B477] hover:underline cursor-pointer"
          >
            Create Your Own Digital Invitation Website →
          </button>
        </div>
      </footer>
    </div>
  );
};

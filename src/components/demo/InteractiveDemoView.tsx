import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  CalendarHeart,
  Check,
  MapPin,
  Clock,
  Heart,
  Music,
  Share2,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { Package, PackageId, Template } from '../../types';

interface InteractiveDemoViewProps {
  template: Template;
  packages: Package[];
  initialPackageId?: PackageId;
  onBack: () => void;
  onBookThisDesign: (templateSlug: string, packageId: PackageId, price: number) => void;
}

export const InteractiveDemoView: React.FC<InteractiveDemoViewProps> = ({
  template,
  packages,
  initialPackageId = 'standard',
  onBack,
  onBookThisDesign,
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>(initialPackageId);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpData, setRsvpData] = useState({
    name: 'Priya Sundaram',
    attending: 'yes',
    guests: '2',
    notes: 'Wishing both of you a lifetime of joy and happiness!',
  });

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 14,
    minutes: 36,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPkg = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const demo = template.demoContent;
  const colors = template.themeColors;

  // Package capabilities
  const isBasic = selectedPackageId === 'basic';
  const isStandard = selectedPackageId === 'standard';
  const isPremium = selectedPackageId === 'premium';

  // Feature capability flags
  const showCountdown = !isBasic; // Standard & Premium
  const showStory = !isBasic; // Standard & Premium
  const showGallery = !isBasic; // Standard & Premium
  const showSchedule = isPremium; // Multi-ceremony schedule: Royal Premium
  const showMusic = !isBasic; // Standard & Premium
  const showRsvp = !isBasic; // Online RSVP: Standard & Royal Premium
  const showDetailedItinerary = isPremium; // Premium has full multi-ceremony
  const showInteractiveMapEmbed = isPremium; // Premium has embedded interactive map

  return (
    <div className="min-h-screen bg-[#29221F] text-[#F8F3EA] flex flex-col">
      {/* ==============================================================================
          TOP DEMO CONTROL BAR
      ============================================================================== */}
      <header className="sticky top-0 z-50 bg-[#29221F]/95 backdrop-blur-md border-b border-[#D4B477]/40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Back button & Design Info */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4B477] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Designs</span>
            </button>

            <div className="hidden sm:block h-5 w-px bg-white/20" />

            <div className="text-right sm:text-left">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white">
                  {template.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6E2639] text-[#D4B477] border border-[#D4B477]/30 uppercase tracking-widest">
                  Live Demo
                </span>
              </div>
            </div>
          </div>

          {/* 3 Package Tabs (Basic ₹499, Standard ₹799, Premium ₹1,199) */}
          <div className="flex items-center p-1 rounded-full bg-black/40 border border-[#D4B477]/40 w-full sm:w-auto justify-center">
            {packages.map((pkg) => {
              const isActive = selectedPackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#D4B477] text-[#29221F] shadow-sm font-bold'
                      : 'text-[#F8F3EA]/70 hover:text-white'
                  }`}
                >
                  <span>{pkg.name.split(' ')[0]}</span>
                  <span className="opacity-80 font-normal">₹{pkg.price.toLocaleString("en-IN")}</span>
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Viewport switch & Book CTA */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Mobile / Desktop switcher */}
            <div className="hidden sm:flex items-center bg-black/30 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-[#D4B477] text-[#29221F]' : 'text-white/60 hover:text-white'
                }`}
                title="Desktop Viewport"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-[#D4B477] text-[#29221F]' : 'text-white/60 hover:text-white'
                }`}
                title="Mobile Viewport"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Book This Design Button */}
            <button
              onClick={() => onBookThisDesign(template.slug, selectedPackageId, currentPkg.price)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#8E364C] border border-[#D4B477]/50 transition-all shadow-md transform active:scale-95 cursor-pointer ml-auto sm:ml-0"
            >
              <CalendarHeart className="w-4 h-4 text-[#D4B477]" />
              <span>Book This Design • ₹{currentPkg.price.toLocaleString("en-IN")}</span>
            </button>
          </div>
        </div>

        {/* Feature status strip showing what this tier includes */}
        <div className="max-w-7xl mx-auto pt-2.5 flex items-center justify-between text-[11px] text-[#F8F3EA]/75 overflow-x-auto gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <span className="font-semibold text-[#D4B477]">
              Active Package: {currentPkg.name.split(' (')[0]} (₹{currentPkg.price.toLocaleString("en-IN")})
            </span>
            <span>•</span>
            <span className={showCountdown ? 'text-emerald-400 flex items-center gap-1' : 'text-gray-500 line-through'}>
              {showCountdown ? '✓ Live Countdown Timer' : '✗ No Countdown'}
            </span>
            <span className={showStory ? 'text-emerald-400 flex items-center gap-1' : 'text-gray-500 line-through'}>
              {showStory ? '✓ Our Story & Photos' : '✗ No Story Section'}
            </span>
            <span className={showGallery ? 'text-emerald-400 flex items-center gap-1' : 'text-gray-500 line-through'}>
              {showGallery ? '✓ Photo Gallery' : '✗ No Photo Gallery'}
            </span>
            <span className={showRsvp ? 'text-emerald-400 flex items-center gap-1 font-bold' : 'text-gray-500 line-through'}>
              {showRsvp ? '✓ Online RSVP Response' : '✗ No RSVP Form'}
            </span>
            <span className={showInteractiveMapEmbed ? 'text-emerald-400 flex items-center gap-1' : 'text-gray-400'}>
              {showInteractiveMapEmbed ? '✓ Embedded Google Maps' : '✓ Google Maps Link'}
            </span>
          </div>

          <span className="hidden md:inline text-[#D4B477]/80 italic">
            Switch packages above to compare features
          </span>
        </div>
      </header>

      {/* ==============================================================================
          INVITATION WEBSITE PREVIEW WRAPPER
      ============================================================================== */}
      <main className="flex-1 overflow-y-auto bg-[#1C1715] flex justify-center py-6 px-2 sm:px-4">
        <div
          className={`transition-all duration-300 w-full ${
            viewportMode === 'mobile'
              ? 'max-w-[420px] rounded-[42px] border-[10px] border-[#2E2724] shadow-2xl overflow-hidden'
              : 'max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-[#D4B477]/25'
          } bg-[#F8F3EA] text-[#29221F] relative`}
        >
          {/* Watermark / Floating Demo Indicator */}
          <div className="sticky top-2 z-40 flex justify-center pointer-events-none px-4">
            <div className="bg-[#6E2639]/95 text-white backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#D4B477]/50 shadow-md flex items-center gap-1.5 pointer-events-auto">
              <Sparkles className="w-3 h-3 text-[#D4B477]" />
              <span>Demo Invitation • {currentPkg.name.split(' ')[0]} Edition</span>
            </div>
          </div>

          {/* Audio toggle button if enabled */}
          {showMusic && (
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className="w-12 h-12 rounded-full bg-[#6E2639] text-[#D4B477] border-2 border-[#D4B477] shadow-lg flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                title={isPlayingMusic ? 'Mute Celebration Music' : 'Play Celebration Music'}
              >
                {isPlayingMusic ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* ==========================================================================
              SECTION 1: HERO INVITATION BANNER
          ========================================================================== */}
          <div className="relative min-h-[520px] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <img
              src={template.heroImageUrl}
              alt={template.name}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#29221F] via-transparent to-black/40" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4 text-white">
              <div className="inline-block p-2 border-y border-[#D4B477]/60">
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4B477] font-semibold">
                  You Are Invited
                </p>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-wide text-white drop-shadow-md">
                {demo.coupleNames}
              </h1>

              <p className="font-serif italic text-lg sm:text-xl text-[#F8F3EA]/90 max-w-md mx-auto">
                {demo.subtitle}
              </p>

              <div className="pt-4 flex items-center justify-center gap-4 text-xs font-sans tracking-widest uppercase text-[#D4B477]">
                <span>{new Date(demo.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>•</span>
                <span>{demo.time}</span>
              </div>
            </div>
          </div>

          {/* ==========================================================================
              SECTION 2: FORMAL INVITATION & BLESSINGS
          ========================================================================== */}
          <div className="py-16 px-6 sm:px-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#E9DFD0] flex items-center justify-center text-[#6E2639]">
              <Sparkles className="w-6 h-6 text-[#D4B477]" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-[#6E2639]">
              The Joy of Joining Hearts
            </h2>

            <p className="font-serif italic text-lg text-[#29221F]/80 leading-relaxed">
              “{demo.quote || 'Where there is love, there is life and divine blessings.'}”
            </p>

            <p className="text-sm text-[#29221F]/75 leading-relaxed font-sans">
              {demo.invitationText}
            </p>
          </div>

          {/* ==========================================================================
              SECTION 3: LIVE COUNTDOWN (ROYAL PREMIUM)
          ========================================================================== */}
          {showCountdown && (
            <div className="py-12 px-6 bg-[#FAF6EE] border-y border-[#D4B477]/30 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4B477]">
                  Countdown to the Event
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Minutes', val: timeLeft.minutes },
                    { label: 'Seconds', val: timeLeft.seconds },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-3 border border-[#D4B477]/30 shadow-xs"
                    >
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
            </div>
          )}

          {/* ==========================================================================
              SECTION 4: EVENT VENUE & DIRECTIONS
          ========================================================================== */}
          <div className="py-16 px-6 sm:px-12 bg-white">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E9DFD0] flex items-center justify-center text-[#6E2639]">
                <MapPin className="w-6 h-6" />
              </div>

              <h2 className="font-serif text-3xl font-bold text-[#29221F]">
                Celebration Venue
              </h2>

              <div className="p-6 rounded-2xl bg-[#F8F3EA] border border-[#D4B477]/30 space-y-2">
                <h3 className="font-serif text-2xl font-bold text-[#6E2639]">
                  {demo.venueName}
                </h3>
                <p className="text-sm text-[#29221F]/70 font-sans">
                  {demo.venueAddress}
                </p>
                <p className="text-xs text-[#D4B477] font-semibold tracking-wider uppercase pt-2">
                  Timing: {demo.time}
                </p>
              </div>

              {/* 1-Click Google Maps button (All packages) */}
              <div className="pt-2">
                <a
                  href={demo.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(demo.venueName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-[#D4B477]" />
                  <span>Get Turn-by-Turn GPS Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* Embedded Google Map (Premium only) */}
              {showInteractiveMapEmbed && (
                <div className="mt-8 rounded-2xl overflow-hidden border-2 border-[#D4B477]/40 shadow-xs">
                  <div className="bg-[#29221F] text-white px-4 py-2 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-[#D4B477]">
                      <Sparkles className="w-3 h-3" /> Interactive Map (Royal Premium)
                    </span>
                    <span className="text-[10px] text-[#F8F3EA]/70">GPS Active</span>
                  </div>
                  <iframe
                    title="Venue Google Map"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${demo.venueName}, ${demo.venueAddress}`
                    )}&output=embed`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ==========================================================================
              SECTION 5: SCHEDULE / MULTI-CEREMONY ITINERARY (ROYAL PREMIUM)
          ========================================================================== */}
          {showSchedule && demo.scheduleItems && demo.scheduleItems.length > 0 && (
            <div className="py-16 px-6 sm:px-12 bg-[#FAF6EE] border-t border-[#D4B477]/30">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4B477]">
                    Order of Events
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#29221F] mt-1">
                    Ceremonial Schedule
                  </h2>
                </div>

                <div className="space-y-4">
                  {demo.scheduleItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white rounded-2xl p-5 border border-[#D4B477]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#D4B477] tracking-wider">
                          Ceremony {idx + 1}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-[#6E2639]">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#29221F]/70 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D4B477]" />
                          <span>{item.time}</span>
                        </p>
                        <p className="text-xs text-[#29221F]/70 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4B477]" />
                          <span>{item.venue}</span>
                        </p>
                      </div>

                      {item.dressCode && (
                        <div className="sm:text-right shrink-0">
                          <span className="text-[9px] uppercase font-semibold text-[#29221F]/50 block">
                            Dress Code
                          </span>
                          <span className="text-xs font-semibold text-[#6E2639] bg-[#F8F3EA] px-3 py-1 rounded-full border border-[#D4B477]/30 inline-block">
                            {item.dressCode}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================================
              SECTION 6: OUR LOVE STORY / JOURNEY (ROYAL PREMIUM)
          ========================================================================== */}
          {showStory && demo.storyTitle && (
            <div className="py-16 px-6 sm:px-12 bg-white border-t border-[#D4B477]/30">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#E9DFD0] flex items-center justify-center text-[#6E2639]">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4B477]">
                  Our Journey
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#29221F]">
                  {demo.storyTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#29221F]/80 leading-relaxed font-sans italic">
                  {demo.storyText}
                </p>
              </div>
            </div>
          )}

          {/* ==========================================================================
              SECTION 7: PHOTO GALLERY (ROYAL PREMIUM)
          ========================================================================== */}
          {showGallery && template.galleryImages && template.galleryImages.length > 0 && (
            <div className="py-16 px-6 sm:px-12 bg-[#FAF6EE] border-t border-[#D4B477]/30">
              <div className="max-w-3xl mx-auto space-y-6 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4B477]">
                  Moments of Joy
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#29221F]">
                  Celebration Gallery
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {template.galleryImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden h-44 sm:h-52 border border-[#D4B477]/40 shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt="Celebration moment"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================================
              SECTION 8: ONLINE RSVP FORM (STANDARD & PREMIUM)
          ========================================================================== */}
          {showRsvp && (
            <div className="py-16 px-6 sm:px-12 bg-white border-t border-[#D4B477]/30">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#6E2639] text-[#D4B477] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4B477] bg-[#6E2639] px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Online RSVP
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#29221F] mt-2">
                    Kindly Confirm Your Presence
                  </h2>
                  <p className="text-xs text-[#29221F]/70 font-sans mt-1">
                    Please RSVP by {demo.rsvpDeadline || 'November 15, 2026'} so we may welcome your family with warmth.
                  </p>
                </div>

                {rsvpSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                    <Check className="w-8 h-8 mx-auto text-emerald-600" />
                    <h4 className="font-serif text-xl font-bold">Demo RSVP Preview</h4>
                    <p className="text-xs">This is a demo preview, so nothing was saved. On a live invitation, each response is saved and shown to the owner in the admin area.</p>
                    <button
                      onClick={() => setRsvpSubmitted(false)}
                      className="mt-2 text-xs font-semibold text-emerald-700 underline cursor-pointer"
                    >
                      Submit another response
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setRsvpSubmitted(true);
                    }}
                    className="p-6 rounded-2xl bg-[#F8F3EA] border border-[#D4B477]/40 space-y-4 text-left"
                  >
                    <div>
                      <label className="text-[11px] font-semibold text-[#29221F] block mb-1">
                        Guest Full Name
                      </label>
                      <input
                        type="text"
                        value={rsvpData.name}
                        onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#29221F] block mb-1">
                        Will you be attending?
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D4B477]/30 cursor-pointer">
                          <input
                            type="radio"
                            name="attending"
                            value="yes"
                            checked={rsvpData.attending === 'yes'}
                            onChange={() => setRsvpData({ ...rsvpData, attending: 'yes' })}
                          />
                          <span>Joyfully Attend</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D4B477]/30 cursor-pointer">
                          <input
                            type="radio"
                            name="attending"
                            value="no"
                            checked={rsvpData.attending === 'no'}
                            onChange={() => setRsvpData({ ...rsvpData, attending: 'no' })}
                          />
                          <span>Regretfully Decline</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#29221F] block mb-1">
                        Number of Attending Family Members
                      </label>
                      <select
                        value={rsvpData.guests}
                        onChange={(e) => setRsvpData({ ...rsvpData, guests: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 Persons</option>
                        <option value="3">3 Persons</option>
                        <option value="4">4+ Persons (Family)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#29221F] block mb-1">
                        Blessings & Message for the Couple
                      </label>
                      <textarea
                        rows={2}
                        value={rsvpData.notes}
                        onChange={(e) => setRsvpData({ ...rsvpData, notes: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D4B477]/40 text-[#29221F]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors shadow-sm cursor-pointer"
                    >
                      Try the RSVP Form (Demo)
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================================
              BOTTOM DEMO ACTION BANNER
          ========================================================================== */}
          <div className="py-12 px-6 bg-gradient-to-b from-[#FAF6EE] to-[#E9DFD0] border-t border-[#D4B477]/40 text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#6E2639]">
              Love This Invitation Design?
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#29221F]">
              Personalize {template.name} For Your Event
            </h3>
            <p className="text-xs text-[#29221F]/70 max-w-md mx-auto">
              Ready to create your celebration website in the <strong>{currentPkg.name}</strong> tier for ₹{currentPkg.price.toLocaleString("en-IN")}?
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onBookThisDesign(template.slug, selectedPackageId, currentPkg.price)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md cursor-pointer"
              >
                Book This Design • ₹{currentPkg.price.toLocaleString("en-IN")}
              </button>
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-semibold text-[#29221F] bg-white hover:bg-[#FAF6EE] border border-[#D4B477]/40 transition-colors cursor-pointer"
              >
                Explore More Designs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

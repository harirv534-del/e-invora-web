import React from 'react';
import { Sparkles, ArrowRight, Eye, CheckCircle2, MapPin, Music, HeartHandshake } from 'lucide-react';
import { Template } from '../../types';

interface HeroProps {
  featuredTemplate?: Template;
  onExploreDesigns: () => void;
  onViewHowItWorks: () => void;
  onViewDemo: (templateSlug: string) => void;
  onBookNow: (templateSlug?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredTemplate,
  onExploreDesigns,
  onViewHowItWorks,
  onViewDemo,
  onBookNow,
}) => {
  const targetSlug = featuredTemplate?.slug || 'royal-rajputana';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8F3EA] via-[#F8F3EA] to-[#E9DFD0]/40 pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Decorative luxury background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-[#D4B477]/10 via-[#6E2639]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-[#D4B477]/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Brand emblem */}
            <img
              src="/e-invora-logo.png"
              srcSet="/e-invora-logo-480.png 480w, /e-invora-logo.png 1000w"
              sizes="(min-width: 640px) 208px, 176px"
              alt="E-INVORA Digital Invitation"
              width={1000}
              height={697}
              decoding="async"
              fetchPriority="high"
              className="mx-auto lg:mx-0 w-44 sm:w-52 h-auto object-contain drop-shadow-sm"
            />

            {/* Monogram tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9DFD0] border border-[#D4B477]/40 text-xs font-semibold uppercase tracking-widest text-[#6E2639]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4B477]" />
              <span>Bespoke Digital Invitation Websites</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#29221F] leading-[1.12]">
              Every Celebration <br />
              <span className="italic font-normal text-[#6E2639]">Deserves a Beautiful</span>{' '}
              <span className="gold-gradient-text block sm:inline">Invitation.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#29221F]/80 max-w-2xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Transform your special day into an unforgettable digital experience.
              Send your guests an exquisite, interactive invitation website featuring your event details,
              1-click Google Maps navigation, photo stories, live countdowns, and instant WhatsApp sharing.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreDesigns}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md hover:shadow-xl transform active:scale-95 cursor-pointer"
              >
                <span>Explore Designs</span>
                <ArrowRight className="w-4 h-4 text-[#D4B477]" />
              </button>

              <button
                onClick={onViewHowItWorks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold tracking-wide text-[#29221F] bg-white/80 hover:bg-white border border-[#D4B477]/50 hover:border-[#D4B477] transition-all shadow-xs cursor-pointer"
              >
                <span>View How It Works</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-[#D4B477]/30 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639]">
                  ₹499<span className="text-sm font-sans text-[#29221F]/60 font-normal"> onwards</span>
                </p>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">Transparent Pricing</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639]">
                  100%
                </p>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">Mobile Responsive</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639]">
                  Same-Day
                </p>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">Team Review & Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Mockup Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Decorative Gold Frame Border */}
            <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-3 shadow-gold-md border-2 border-[#D4B477]/40">
              {/* Inner Smartphone / Tablet Styled Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-[#F8F3EA] border border-[#D4B477]/30 shadow-inner">
                {/* Top Notch Bar */}
                <div className="bg-[#29221F] text-[#F8F3EA] px-4 py-2 flex items-center justify-between text-[11px] font-sans">
                  <span className="flex items-center gap-1 text-[#D4B477] font-semibold tracking-wider">
                    <Sparkles className="w-3 h-3" /> E-INVORA LIVE PREVIEW
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#6E2639] text-white text-[9px] uppercase font-bold tracking-wider">
                    Interactive
                  </span>
                </div>

                {/* Simulated Invitation Website Hero */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                    alt="Wedding Invitation preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6E2639] via-[#6E2639]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-center text-white">
                    <span className="text-[10px] tracking-widest uppercase text-[#D4B477] font-sans font-medium">
                      Wedding Celebration
                    </span>
                    <h3 className="font-serif text-2xl font-bold tracking-wide">
                      Aditya & Meera
                    </h3>
                    <p className="text-[11px] text-[#F8F3EA]/90 font-serif italic">
                      November 28, 2026 • The Leela Palace
                    </p>
                  </div>
                </div>

                {/* Simulated Feature Pills */}
                <div className="p-4 space-y-3 bg-[#FAF6EE]">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#D4B477]/25 text-[#29221F]">
                      <MapPin className="w-3.5 h-3.5 text-[#6E2639]" />
                      <span className="truncate">Google Maps Location</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#D4B477]/25 text-[#29221F]">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#6E2639]" />
                      <span className="truncate">Online RSVP Tracker</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-[#29221F]/70 font-sans italic">
                    “Every celebration begins with an invitation that sets the tone for a lifetime.”
                  </p>

                  {/* Actions inside demo card - fully unblocked and visible */}
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDemo(targetSlug)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D4B477] shrink-0" />
                      <span>Explore Live Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookNow(targetSlug)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#29221F] bg-[#D4B477] hover:bg-[#EBD8A9] transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe WhatsApp Ready Notification - positioned cleanly below the card, never overlapping buttons or preview */}
            <div className="mt-4 w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-3 shadow-xs border border-[#D4B477]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#29221F]">WhatsApp Ready</p>
                  <p className="text-[11px] text-[#29221F]/70">Share with guests in 1 click</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                1-Click Share
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

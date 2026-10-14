import React from 'react';
import { MessageCircle, Sparkles, CalendarHeart } from 'lucide-react';
import { AppSettings } from '../../types';

interface WhatsAppCTAProps {
  settings: AppSettings;
  onBookNow: () => void;
}

export const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({ settings, onBookNow }) => {
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello E-INVORA! I would like to consult with a designer regarding our upcoming celebration invitation.'
  )}`;

  return (
    <section className="py-20 bg-gradient-to-r from-[#6E2639] via-[#571C2B] to-[#4A1624] text-white relative overflow-hidden">
      {/* Decorative Shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,180,119,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4B477]/20 border border-[#D4B477]/40 text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Concierge Design Desk</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          Ready to Create an Unforgettable <br />
          <span className="text-[#D4B477] italic font-normal">Invitation Experience?</span>
        </h2>

        <p className="text-sm sm:text-base text-[#F8F3EA]/80 max-w-2xl mx-auto font-sans leading-relaxed">
          Chat directly with our design consultants or submit your event details online.
          No customer registration or password required.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-[#29221F] bg-[#D4B477] hover:bg-[#EBD8A9] transition-all shadow-md hover:shadow-xl transform active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-emerald-800" />
            <span>Chat on WhatsApp ({settings.whatsappNumber})</span>
          </a>

          <a
            href={`tel:+${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all"
          >
            <span>Call {settings.primaryPhone}</span>
          </a>
          <a
            href={`mailto:${settings.contactEmail}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all"
          >
            <span>Email Us</span>
          </a>

          <button
            onClick={onBookNow}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all cursor-pointer"
          >
            <CalendarHeart className="w-4 h-4 text-[#D4B477]" />
            <span>Book Online Form</span>
          </button>
        </div>

        <p className="text-xs text-[#F8F3EA]/60 pt-2 font-serif italic">
          “Every Celebration Deserves a Beautiful Invitation.”
        </p>
      </div>
    </section>
  );
};

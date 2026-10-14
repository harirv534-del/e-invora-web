import React from 'react';
import { CheckCircle2, Home, Sparkles, MessageCircle } from 'lucide-react';
import { AppSettings } from '../../types';

interface ThankYouPageProps {
  bookingReference: string;
  templateName: string;
  packageName: string;
  agreedPrice: number;
  settings: AppSettings;
  onGoHome: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  bookingReference,
  templateName,
  packageName,
  agreedPrice,
  settings,
  onGoHome,
}) => {
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello E-INVORA team! I have submitted my booking enquiry. Reference: ${bookingReference} (${templateName} - ${packageName}).`
  )}`;

  return (
    <div className="py-20 bg-gradient-to-b from-[#F8F3EA] via-[#FAF6EE] to-[#E9DFD0]/40 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4B477]/40 shadow-gold-md text-center space-y-8 relative overflow-hidden">
          {/* Decorative Gold Sheen */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6E2639] via-[#D4B477] to-[#6E2639]" />

          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-[#E9DFD0] text-[#6E2639] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          {/* Headings */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F] tracking-tight">
                Thank You for Your Booking Enquiry!
              </h1>
              <h2 className="text-sm sm:text-base font-semibold text-[#D4B477] uppercase tracking-wider font-sans">
                We Have Received Your Details
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-[#29221F]/85 max-w-lg mx-auto font-sans leading-relaxed space-y-4 pt-1">
              <p className="p-4 rounded-2xl bg-[#F8F3EA] border border-[#D4B477]/30 text-[#29221F] font-medium text-xs sm:text-sm leading-relaxed">
                Thank you for choosing E-INVORA for your special occasion. We have received your celebration details. Our concierge team will review your requirements and reach out to you via WhatsApp or phone call.
              </p>

              <p className="font-serif font-bold text-[#6E2639] text-base pt-1">
                E-INVORA — Every Celebration Deserves a Beautiful Invitation.
              </p>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-[#F8F3EA] border border-[#D4B477]/35 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#D4B477]/20 pb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-[#29221F]/70 font-bold">
                Booking Reference
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#6E2639] bg-white px-3 py-1 rounded-lg border border-[#D4B477]/30">
                {bookingReference || 'EINV-2026-PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#29221F]/70">Selected Design:</span>
              <span className="font-semibold text-[#29221F]">{templateName}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#29221F]/70">Package Tier:</span>
              <span className="font-semibold text-[#29221F]">
                {packageName} (₹{agreedPrice.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D4B477]/15">
              <span className="text-[#29221F]/70">Next Step:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4B477]" /> Our team will contact you directly
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#D4B477]" />
              <span>Return to Home</span>
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-[#29221F] bg-white hover:bg-[#F8F3EA] border border-[#D4B477]/50 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

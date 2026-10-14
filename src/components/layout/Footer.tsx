import React from 'react';
import { MessageCircle, Phone, Mail, Heart, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { AppSettings } from '../../types';

interface FooterProps {
  settings: AppSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello E-INVORA, I would like to enquire about a digital invitation.'
  )}`;

  return (
    <footer className="bg-[#29221F] text-[#F8F3EA] pt-16 pb-12 border-t-2 border-[#D4B477]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#D4B477]/20">
          {/* Brand Column */}
          <div className="space-y-4">
            <img
              src="/e-invora-logo-240.png"
              srcSet="/e-invora-logo-240.png 240w, /e-invora-logo-480.png 480w"
              sizes="144px"
              alt="E-INVORA Digital Invitation"
              width={240}
              height={167}
              loading="lazy"
              decoding="async"
              className="w-32 sm:w-36 h-auto object-contain"
            />
            <p className="text-sm font-serif italic text-[#D4B477]/90 text-lg leading-snug">
              “{settings.tagline}”
            </p>
            <p className="text-xs text-[#F8F3EA]/70 leading-relaxed font-sans">
              Bespoke, interactive digital invitation websites with elegant designs and easy sharing for weddings, receptions, housewarmings, and special milestones.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-[#6E2639]/80 text-[#D4B477] border border-[#D4B477]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4B477]" />
                100% Verified Manual Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-[#D4B477] uppercase text-xs">
              Explore E-INVORA
            </h4>
            <ul className="space-y-2 text-sm text-[#F8F3EA]/75">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer"
                >
                  Invitation Designs Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/#pricing')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer"
                >
                  Packages: Basic, Standard & Premium
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/#how-it-works')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/book')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-[#D4B477] font-medium"
                >
                  Book Your Invitation Website
                </button>
              </li>
            </ul>
          </div>

          {/* Celebrations */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-[#D4B477] uppercase text-xs">
              Celebration Categories
            </h4>
            <ul className="space-y-2 text-sm text-[#F8F3EA]/75">
              <li>
                <button
                  onClick={() => onNavigate('/gallery?category=traditional-indian-wedding')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-left"
                >
                  Traditional Indian Weddings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery?category=modern-luxury-wedding')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-left"
                >
                  Modern Luxury Weddings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery?category=minimalist-wedding')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-left"
                >
                  Minimalist & Contemporary
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery?category=housewarming')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-left"
                >
                  Housewarming
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/gallery?category=baby-shower')}
                  className="hover:text-[#D4B477] transition-colors cursor-pointer text-left"
                >
                  Baby Showers & Naming Ceremonies
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-[#D4B477] uppercase text-xs">
              Concierge & Enquiries
            </h4>
            <p className="text-xs text-[#F8F3EA]/70">
              Have a question or a special request? Contact us:
            </p>
            <div className="space-y-2.5 pt-1 text-xs">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </a>
              <a
                href={`tel:+${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2.5 text-[#F8F3EA]/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 text-[#D4B477]" />
                <span>Call: {settings.primaryPhone}</span>
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center gap-2.5 text-[#F8F3EA]/80 hover:text-white transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0 text-[#D4B477]" />
                <span>Email: {settings.contactEmail}</span>
              </a>
            </div>
            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#D4B477] text-[#29221F] hover:bg-[#EBD8A9] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Custom Consultation</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8F3EA]/50 gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} E-INVORA. All rights reserved. Every Celebration Deserves a Beautiful Invitation.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/book')}
              className="hover:text-[#D4B477] transition-colors cursor-pointer"
            >
              Client Enquiry Form
            </button>
            <span>•</span>
            <span className="text-[#D4B477]/80">Direct Concierge Booking</span>
            <span>•</span>
            <button
              onClick={() => onNavigate('/admin/login')}
              className="inline-flex items-center gap-1 hover:text-[#D4B477] text-[#F8F3EA]/40 transition-colors cursor-pointer"
              title="Private Owner-Only Management"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

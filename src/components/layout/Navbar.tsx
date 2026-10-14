import React, { useState } from 'react';
import { Menu, X, Sparkles, MessageCircle, Lock, CalendarHeart } from 'lucide-react';
import { AppSettings } from '../../types';

interface NavbarProps {
  settings: AppSettings;
  currentPath: string;
  onNavigate: (path: string, params?: any) => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentPath,
  onNavigate,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Designs Gallery', path: '/gallery' },
    { label: 'Packages & Pricing', path: '/#pricing' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'FAQs', path: '/#faqs' },
  ];

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const id = path.replace('/#', '');
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello E-INVORA! I would like to enquire about a personalized digital invitation website.'
  )}`;

  return (
    <header className="sticky top-0 z-50 bg-[#F8F3EA]/95 backdrop-blur-md border-b border-[#D4B477]/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-24">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('/');
            }}
            className="flex items-center shrink-0 mr-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B477] rounded-md"
            aria-label="E-INVORA home"
          >
            <img
              src="/e-invora-logo-480.png"
              srcSet="/e-invora-logo-240.png 240w, /e-invora-logo-480.png 480w, /e-invora-logo.png 1000w"
              sizes="(min-width: 640px) 104px, 84px"
              alt="E-INVORA Digital Invitation"
              width={480}
              height={335}
              decoding="async"
              className="h-14 sm:h-[72px] w-auto max-w-none object-contain transition-transform duration-300 hover:scale-[1.03]"
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.path)}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  currentPath === link.path
                    ? 'text-[#6E2639] font-semibold'
                    : 'text-[#29221F]/80 hover:text-[#6E2639]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* WhatsApp Quick Enquiry */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#29221F] bg-white/70 hover:bg-white border border-[#D4B477]/40 rounded-full transition-all shadow-xs"
              title="Chat with our design team on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Us</span>
            </a>

            {/* Primary Book CTA */}
            <button
              onClick={() => handleLinkClick('/book')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md hover:shadow-lg transform active:scale-95 cursor-pointer"
            >
              <CalendarHeart className="w-4 h-4 text-[#D4B477]" />
              <span>Book Invitation</span>
            </button>

            {/* Owner Admin Access Button */}
            <button
              onClick={() => onNavigate(isAdminLoggedIn ? '/admin' : '/admin/login')}
              className="p-2 rounded-full text-[#29221F]/60 hover:text-[#6E2639] hover:bg-[#E9DFD0]/40 transition-colors cursor-pointer"
              title="Owner Admin Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleLinkClick('/book')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#6E2639]"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#29221F] hover:text-[#6E2639] focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F3EA] border-b border-[#D4B477]/40 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.path)}
              className="block w-full text-left py-2 text-base font-medium text-[#29221F] hover:text-[#6E2639] cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#D4B477]/30 flex flex-col gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
            <button
              onClick={() => handleLinkClick('/book')}
              className="w-full py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider text-white bg-[#6E2639]"
            >
              Book Your Invitation
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(isAdminLoggedIn ? '/admin' : '/admin/login');
              }}
              className="flex items-center justify-center gap-2 py-2 text-xs text-[#29221F]/70 hover:text-[#6E2639]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Admin Access</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

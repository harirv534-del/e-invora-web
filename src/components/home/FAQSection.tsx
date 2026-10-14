import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do my guests need to download an app or register an account to view the invitation?',
      a: 'No, not at all! Your invitation website works seamlessly in any browser (Chrome, Safari, WhatsApp in-app browser) on mobile, tablet, or computer. Guests simply tap your unique link and the invitation opens instantly.',
    },
    {
      q: 'How long does it take for my invitation website to go live?',
      a: 'Once you submit your booking details and confirm your event requirements with our team, we prepare your private review draft within 4 to 8 hours. Once you approve the wording and photos, your invitation is published immediately.',
    },
    {
      q: 'Can I include multiple ceremonies such as engagement, wedding, and reception?',
      a: 'Yes! Our Standard and Premium packages feature a dedicated multi-ceremony schedule with custom dates, timings, venues, dress codes, and Google Maps direction links for each individual event.',
    },
    {
      q: 'Can our invitation be created in our regional language (Hindi, Tamil, Telugu, Gujarati, etc.)?',
      a: 'Absolutely. We support bilingual and regional language scripts including Hindi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Bengali, and Marathi, alongside English.',
    },
    {
      q: 'How does booking work? Do I need to pay online right now?',
      a: 'No online payment is required at this stage! Simply choose your preferred design and submit your celebration details through our simple enquiry form. Our concierge team will contact you directly on WhatsApp or by phone to review your requirements, confirm the details, and guide you through the personalized next steps.',
    },
    {
      q: 'What if event details or timings change after publishing?',
      a: 'Our concierge team can update timings, venue addresses, or schedule details anytime upon your request. The changes reflect instantly on your live invitation website without changing the link you already shared with guests.',
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-20 bg-white border-b border-[#D4B477]/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F] mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#29221F]/70 mt-2 font-sans">
            Everything you need to know about our bespoke digital celebration websites.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#D4B477]/30 bg-[#F8F3EA]/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-serif text-lg font-bold text-[#29221F] hover:text-[#6E2639] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#D4B477] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#6E2639]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-[#29221F]/80 leading-relaxed font-sans border-t border-[#D4B477]/15 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

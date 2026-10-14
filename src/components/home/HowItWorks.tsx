import React from 'react';
import { Palette, FileEdit, UserCheck, Send, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartBooking: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartBooking }) => {
  const steps = [
    {
      number: '01',
      icon: <Palette className="w-6 h-6 text-[#6E2639]" />,
      title: 'Select Design & Package',
      description:
        'Browse our gallery of invitation designs for every event. Open a live demo for each package: Basic, Standard and Royal Premium.',
    },
    {
      number: '02',
      icon: <FileEdit className="w-6 h-6 text-[#6E2639]" />,
      title: 'Submit Celebration Details',
      description:
        'Fill out our simple enquiry form with celebrant names, event date and time, venue location, and optional photos. No customer account or registration needed.',
    },
    {
      number: '03',
      icon: <UserCheck className="w-6 h-6 text-[#6E2639]" />,
      title: 'Concierge Review & Verification',
      description:
        'Our design team reviews your requirements, contacts you directly to confirm celebration details, curates bespoke invitation copy, and crafts your private preview draft.',
    },
    {
      number: '04',
      icon: <Send className="w-6 h-6 text-[#6E2639]" />,
      title: 'Publish & Share on WhatsApp',
      description:
        'Your custom invitation website goes live at a unique shareable link (e.g. /invite/aditya-weds-meera). Share with all your guests across WhatsApp and SMS with 1 click.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-[#D4B477]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            Effortless 4-Step Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F] mt-1">
            How E-INVORA Works
          </h2>
          <p className="text-sm text-[#29221F]/70 mt-2 font-sans">
            From initial inspiration to sharing your personalized digital celebration invitation with family and friends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative bg-[#F8F3EA]/70 rounded-3xl p-6 border border-[#D4B477]/30 hover:border-[#D4B477] transition-all hover:shadow-gold-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E9DFD0] flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#D4B477]/70">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#29221F] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#29221F]/75 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-[#D4B477]/60">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onStartBooking}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md cursor-pointer"
          >
            <span>Book Your Digital Invitation Today</span>
            <ArrowRight className="w-4 h-4 text-[#D4B477]" />
          </button>
        </div>
      </div>
    </section>
  );
};

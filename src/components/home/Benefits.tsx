import React from 'react';
import {
  Navigation,
  Users,
  Image,
  Clock,
  Share2,
  Leaf,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Share2 className="w-6 h-6 text-[#6E2639]" />,
      title: 'Instant WhatsApp Sharing',
      description:
        'Send an elegant card link with custom preview images and couple names directly to hundreds of guests on WhatsApp in seconds.',
    },
    {
      icon: <Navigation className="w-6 h-6 text-[#6E2639]" />,
      title: '1-Click Google Maps Navigation',
      description:
        'Guests never get lost. Embedded Google Maps links open directly in their GPS navigation app for seamless arrival at the wedding hall or mandapam.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#6E2639]" />,
      title: 'Online RSVP',
      description:
        'Allow guests to easily RSVP and confirm family member counts, giving you accurate catering headcounts and zero guesswork.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#6E2639]" />,
      title: 'Live Countdown Timer',
      description:
        'Build excitement with a live countdown to your event so guests never miss the big moment.',
    },
    {
      icon: <Image className="w-6 h-6 text-[#6E2639]" />,
      title: 'Curated Photo Memories',
      description:
        'Showcase your engagement, pre-wedding shoot, or family journey in a gorgeous, high-resolution mobile-optimized gallery.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-[#6E2639]" />,
      title: 'Eco-Friendly & Zero Waste',
      description:
        'Save trees and avoid printing delays. Make last-minute schedule or timing updates instantly without reprinting thousands of cards.',
    },
  ];

  return (
    <section className="py-20 bg-[#F8F3EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            The Modern Celebration Advantage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F] mt-1">
            Why Choose a Digital Invitation Website?
          </h2>
          <p className="text-sm text-[#29221F]/70 mt-2 font-sans">
            Far beyond a static PDF or picture, an E-INVORA website is an interactive celebration portal designed for today’s connected families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-[#D4B477]/30 hover:border-[#D4B477] shadow-xs hover:shadow-gold-sm transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E9DFD0] flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#29221F] mb-2">
                {b.title}
              </h3>
              <p className="text-xs text-[#29221F]/75 leading-relaxed font-sans">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

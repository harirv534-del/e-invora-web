import React from 'react';
import { Check, X, Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Package } from '../../types';

interface PackageShowcaseProps {
  packages: Package[];
  onSelectPackage: (packageId: string) => void;
  onViewDemoWithPackage: (packageId: string) => void;
}

export const PackageShowcase: React.FC<PackageShowcaseProps> = ({
  packages,
  onSelectPackage,
  onViewDemoWithPackage,
}) => {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-[#F8F3EA] via-[#FAF6EE] to-[#E9DFD0]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            Simple & Transparent Tiers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#29221F] mt-2">
            Explore Basic, Standard & Premium
          </h2>
          <p className="text-base text-[#29221F]/70 mt-3 font-sans leading-relaxed">
            Every package delivers a dedicated, responsive digital invitation website.
            Choose the level of storytelling, interactivity, and multimedia that suits your celebration.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const isStandard = pkg.id === 'standard';
            const isPremium = pkg.id === 'premium';

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPremium
                    ? 'bg-gradient-to-b from-[#6E2639] to-[#4A1624] text-white shadow-gold-md border-2 border-[#D4B477] md:-translate-y-2'
                    : isStandard
                    ? 'bg-white text-[#29221F] shadow-gold-sm border-2 border-[#D4B477]/50'
                    : 'bg-white/90 text-[#29221F] border border-[#D4B477]/30 shadow-xs'
                }`}
              >
                {/* Popular or Recommended Badge */}
                {isPremium && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#D4B477] text-[#29221F] text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular Choice
                  </div>
                )}
                {isStandard && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E9DFD0] text-[#6E2639] text-[10px] font-semibold uppercase tracking-wider border border-[#D4B477]/40">
                    Recommended For Weddings
                  </div>
                )}

                <div>
                  {/* Tier Title & Description */}
                  <div className="border-b pb-6 border-current/15">
                    <h3
                      className={`font-serif text-2xl font-bold ${
                        isPremium ? 'text-[#D4B477]' : 'text-[#6E2639]'
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className={`text-xs mt-2 leading-relaxed ${
                        isPremium ? 'text-[#F8F3EA]/80' : 'text-[#29221F]/70'
                      }`}
                    >
                      {pkg.description}
                    </p>

                    {/* Price Tag */}
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs font-sans uppercase tracking-wider ${
                          isPremium ? 'text-[#D4B477]' : 'text-[#29221F]/60'
                        }`}
                      >
                        one-time fee
                      </span>
                    </div>
                  </div>

                  {/* Feature Capabilities Breakdown */}
                  <div className="py-6 space-y-3">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider block ${
                        isPremium ? 'text-[#D4B477]' : 'text-[#6E2639]'
                      }`}
                    >
                      Included Features:
                    </span>
                    <ul className="space-y-3 text-xs leading-normal">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isPremium
                                ? 'bg-[#D4B477] text-[#29221F]'
                                : 'bg-[#6E2639]/10 text-[#6E2639]'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <span className={isPremium ? 'text-[#F8F3EA]/90' : 'text-[#29221F]/80'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-6 border-t border-current/15 space-y-2.5">
                  <button
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md transform active:scale-95 cursor-pointer ${
                      isPremium
                        ? 'bg-[#D4B477] text-[#29221F] hover:bg-[#EBD8A9]'
                        : 'bg-[#6E2639] text-white hover:bg-[#571C2B]'
                    }`}
                  >
                    Select {pkg.name.split(' ')[0]} & Book
                  </button>

                  <button
                    onClick={() => onViewDemoWithPackage(pkg.id)}
                    className={`w-full py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer text-center ${
                      isPremium
                        ? 'text-[#F8F3EA]/70 hover:text-white'
                        : 'text-[#29221F]/70 hover:text-[#6E2639]'
                    }`}
                  >
                    Explore {pkg.name.split(' ')[0]} in Live Demo →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Footer */}
        <div className="mt-16 p-6 rounded-3xl bg-white border border-[#D4B477]/40 shadow-xs max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E9DFD0] flex items-center justify-center text-[#6E2639] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#29221F]">
                Zero Risk • Direct Human Verification
              </h4>
              <p className="text-xs text-[#29221F]/70">
                You only pay after our design team confirms your event requirements and prepares your private draft preview.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPackage('premium')}
            className="shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors cursor-pointer"
          >
            Start Booking
          </button>
        </div>
      </div>
    </section>
  );
};

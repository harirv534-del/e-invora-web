import React, { useState, useMemo } from 'react';
import { Eye, CalendarHeart, Sparkles, ArrowRight, Search, X, Check, Filter } from 'lucide-react';
import { EventCategory, Package, Template } from '../../types';

interface FeaturedDesignsProps {
  templates: Template[];
  categories?: EventCategory[];
  packages?: Package[];
  onViewDemo: (templateSlug: string) => void;
  onBookDesign: (templateSlug: string) => void;
  onViewAllGallery: () => void;
  initialCategory?: string;
}

export const FeaturedDesigns: React.FC<FeaturedDesignsProps> = ({
  templates,
  categories = [],
  packages = [],
  onViewDemo,
  onBookDesign,
  onViewAllGallery,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [searchQuery, setSearchQuery] = useState<string>('');

  // Starting price calculated from packages
  const startingPrice = useMemo(() => {
    const basicPkg = packages.find((p) => p.id === 'basic');
    return basicPkg?.price || 499;
  }, [packages]);

  // Filter templates based on category, style attribute, and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Category filter
      if (selectedCategory !== 'all' && tpl.categoryId !== selectedCategory) {
        return false;
      }


      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tpl.name.toLowerCase().includes(q);
        const matchesDesc = tpl.description.toLowerCase().includes(q);
        const matchesCouple = tpl.demoContent?.coupleNames?.toLowerCase().includes(q);
        const matchesCategory = categories
          .find((c) => c.id === tpl.categoryId)
          ?.name.toLowerCase()
          .includes(q);

        return matchesName || matchesDesc || matchesCouple || matchesCategory;
      }

      return true;
    });
  }, [templates, selectedCategory, searchQuery, categories]);

  return (
    <section id="featured-designs" className="py-20 bg-[#F8F3EA] border-b border-[#D4B477]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DFD0] text-[#6E2639] border border-[#D4B477]/40 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D4B477]" />
              <span>Curated Invitation Designs</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#29221F]">
              Featured Invitation Designs
            </h2>
            <p className="text-xs sm:text-sm text-[#29221F]/75 max-w-2xl font-sans leading-relaxed">
              Explore our handcrafted invitation website designs. Preview the live interactive demo and book online with ease.
            </p>
          </div>

          <button
            onClick={onViewAllGallery}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6E2639] hover:text-[#4A1624] group cursor-pointer shrink-0 py-2"
          >
            <span>View All Designs</span>
            <ArrowRight className="w-4 h-4 text-[#D4B477] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Filter Navigation Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#D4B477]/35 shadow-xs space-y-5">
          {/* Top Row: Search and Result Counter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#D4B477] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by design name or occasion..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#29221F]/40 hover:text-[#29221F]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-[#29221F]/70 flex items-center gap-2 self-start sm:self-auto">
              <span>Available Designs: <strong className="text-[#6E2639] font-bold">{filteredTemplates.length}</strong></span>
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="ml-2 text-xs font-semibold text-[#6E2639] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4B477] block mb-2">
              Select Event Category:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#6E2639] text-white shadow-xs'
                    : 'bg-[#F8F3EA] text-[#29221F] hover:bg-[#E9DFD0]'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6E2639] text-white shadow-xs border border-[#D4B477]/50'
                        : 'bg-[#F8F3EA] text-[#29221F] hover:bg-[#E9DFD0]'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Featured Design Cards Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#D4B477]/30 p-8 space-y-3">
            <p className="font-serif text-2xl text-[#29221F]">No designs found</p>
            <p className="text-xs text-[#29221F]/60">Please choose another category or reset your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6E2639] hover:bg-[#571C2B] cursor-pointer"
            >
              Show All Designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => {
              const categoryObj = categories.find((c) => c.id === template.categoryId);

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#D4B477]/35 shadow-gold-sm hover:shadow-gold-md transition-all duration-300 flex flex-col group justify-between"
                >
                  {/* Top: Actual Invitation Website Style Preview */}
                  <div>
                    <div className="relative h-64 overflow-hidden bg-[#E9DFD0]">
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30" />

                      {/* Event Type badge */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#6E2639]/95 backdrop-blur-xs border border-[#D4B477]/40 shadow-xs flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#D4B477]" />
                          <span>{categoryObj?.name || 'Invitation'}</span>
                        </span>
                      </div>

                      {/* Live Website Demo Overlay Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#29221F] bg-[#D4B477] shadow-xs">
                          Live Demo Ready
                        </span>
                      </div>

                      {/* Couple / Celebrant names */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-[11px] font-sans text-[#D4B477] font-semibold tracking-wider">
                          {template.demoContent.coupleNames}
                        </p>
                        <h3 className="font-serif text-2xl font-bold leading-tight drop-shadow-sm">
                          {template.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-4">
                      {/* Short Understandable Description */}
                      <p className="text-xs text-[#29221F]/80 leading-relaxed font-sans line-clamp-2">
                        {template.description}
                      </p>

                    </div>
                  </div>

                  {/* Bottom: Starting Price & Dual CTAs */}
                  <div className="p-6 pt-0 space-y-4">
                    {/* Starting Package Price from Database */}
                    <div className="pt-4 border-t border-[#D4B477]/25 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#29221F]/60 block font-semibold">
                          Starting Price:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-2xl font-bold text-[#6E2639]">
                            ₹{startingPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-[#29221F]/60 font-sans">
                            onwards
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#29221F]/70 font-sans">
                        Available in Basic, Standard, and Premium packages
                      </p>
                    </div>

                    {/* Prominent Actions: View Demo & Book Design */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => onViewDemo(template.slug)}
                        className="w-full py-3 px-2 rounded-2xl text-xs font-semibold text-[#29221F] bg-[#F8F3EA] hover:bg-[#E9DFD0] border border-[#D4B477]/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        title="Explore live website demo"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#6E2639] shrink-0" />
                        <span className="truncate">View Demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onBookDesign(template.slug)}
                        className="w-full py-3 px-2 rounded-2xl text-xs font-bold text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center border border-[#D4B477]/40"
                        title="Book this design"
                      >
                        <CalendarHeart className="w-3.5 h-3.5 text-[#D4B477] shrink-0" />
                        <span className="truncate">Book Design</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, Eye, CalendarHeart, Sparkles, Filter, X } from 'lucide-react';
import { EventCategory, Package, Template } from '../../types';

interface DesignGalleryProps {
  templates: Template[];
  categories: EventCategory[];
  packages?: Package[];
  initialCategory?: string;
  onViewDemo: (slug: string) => void;
  onBookDesign: (slug: string) => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  templates,
  categories,
  packages = [],
  initialCategory,
  onViewDemo,
  onBookDesign,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const priceRange = useMemo(() => {
    const prices = packages.filter((p) => p.isActive !== false).map((p) => p.price);
    if (prices.length === 0) return '₹499 — ₹1,199';
    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
    return `${fmt(Math.min(...prices))} — ${fmt(Math.max(...prices))}`;
  }, [packages]);

  // Number designs inside the same event type (e.g. Wedding Invitation, Design 2)
  const designNumber = (tpl: Template) => {
    const same = templates.filter((t) => t.categoryId === tpl.categoryId);
    return same.length > 1 ? same.findIndex((t) => t.id === tpl.id) + 1 : 0;
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Category match
      if (selectedCategory !== 'all' && tpl.categoryId !== selectedCategory) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tpl.name.toLowerCase().includes(q);
        const matchesDesc = tpl.description.toLowerCase().includes(q);
        const matchesNames = (tpl.demoContent?.coupleNames || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesNames) {
          return false;
        }
      }
      return true;
    });
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div className="py-12 bg-[#F8F3EA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            Choose Your Design
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#29221F]">
            Invitation Gallery
          </h1>
          <p className="text-sm text-[#29221F]/70 font-sans leading-relaxed">
            Pick an event, then tap <span className="font-semibold text-[#6E2639]">“View Demo”</span> to see how each package looks.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#D4B477]/35 shadow-xs space-y-5">
          {/* Top row: Search input & Active filters badge */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#D4B477] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event or name..."
                className="w-full pl-11 pr-10 py-3 rounded-full text-xs bg-[#F8F3EA] border border-[#D4B477]/40 focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30 text-[#29221F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#29221F]/40 hover:text-[#29221F]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-[#29221F]/60 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#6E2639]" />
              <span>Showing <strong>{filteredTemplates.length}</strong> available designs</span>
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="ml-2 text-xs font-semibold text-[#6E2639] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#29221F]/70 block">
              Event Type:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#6E2639] text-white shadow-xs'
                    : 'bg-[#F8F3EA] text-[#29221F] hover:bg-[#E9DFD0]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#6E2639] text-white shadow-xs'
                      : 'bg-[#F8F3EA] text-[#29221F] hover:bg-[#E9DFD0]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Gallery Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4B477]/30 p-8">
            <p className="font-serif text-2xl text-[#29221F]">No designs match your criteria</p>
            <p className="text-xs text-[#29221F]/60 mt-1">Try a different event type or search word.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6E2639]"
            >
              Show All Designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#D4B477]/35 shadow-gold-sm hover:shadow-gold-md transition-all duration-300 flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative h-64 overflow-hidden bg-[#E9DFD0]">
                  <img
                    src={template.thumbnailUrl}
                    alt={`${template.name} preview`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#6E2639]/90 backdrop-blur-xs border border-[#D4B477]/30">
                      {categories.find((c) => c.id === template.categoryId)?.name || 'Event'}
                    </span>
                    {template.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#29221F] bg-[#D4B477] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-sans text-[#D4B477] font-semibold uppercase tracking-wider">
                      {template.demoContent.coupleNames}
                    </p>
                    <h3 className="font-serif text-2xl font-bold leading-tight drop-shadow-sm">
                      {template.name}
                      {designNumber(template) > 0 && (
                        <span className="text-sm font-sans font-medium text-white/80"> · Design {designNumber(template)}</span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-[#29221F]/75 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#D4B477]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#29221F]/60 block font-semibold">
                        Package Price:
                      </span>
                      <span className="font-serif text-lg font-bold text-[#6E2639]">
                        {priceRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onViewDemo(template.slug)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold text-[#29221F] bg-[#F8F3EA] hover:bg-[#E9DFD0] border border-[#D4B477]/40 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#6E2639]" />
                        <span>View Demo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookDesign(template.slug)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#6E2639] hover:bg-[#571C2B] transition-colors cursor-pointer"
                      >
                        <CalendarHeart className="w-3.5 h-3.5 text-[#D4B477]" />
                        <span>Book Design</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

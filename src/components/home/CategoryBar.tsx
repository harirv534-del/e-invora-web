import React from 'react';
import {
  Sparkles,
  Crown,
  Feather,
  GlassWater,
  HeartHandshake,
  Cake,
  Heart,
  Gem,
  Baby,
  Sun,
  Home,
  Compass,
} from 'lucide-react';
import { EventCategory } from '../../types';

interface CategoryBarProps {
  categories: EventCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Feather: <Feather className="w-5 h-5" />,
  GlassWater: <GlassWater className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Cake: <Cake className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Gem: <Gem className="w-5 h-5" />,
  Baby: <Baby className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-12 bg-[#F8F3EA] border-b border-[#D4B477]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4B477]">
            Event Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F]">
            Invitations for Every Occasion
          </h2>
          <p className="text-xs sm:text-sm text-[#29221F]/75 font-sans">
            Choose from beautiful, mobile-friendly invitation websites crafted for your special day.
          </p>
        </div>

        {/* Categories Grid - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const icon = ICON_MAP[cat.icon] || <Sparkles className="w-5 h-5" />;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl text-center transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[#6E2639] text-white shadow-md border-2 border-[#D4B477]'
                    : 'bg-white hover:bg-[#FAF6EE] text-[#29221F] border border-[#D4B477]/30 hover:border-[#D4B477] shadow-xs'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shrink-0 ${
                    isSelected
                      ? 'bg-[#D4B477] text-[#29221F]'
                      : 'bg-[#F8F3EA] text-[#6E2639]'
                  }`}
                >
                  {icon}
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1 block">
                  {cat.name}
                </span>
                <span className={`text-[10px] line-clamp-1 mt-0.5 block ${isSelected ? 'text-[#D4B477]' : 'text-[#29221F]/60'}`}>
                  View Designs
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

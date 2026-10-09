import React, { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SearchBarRow: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    navigateTo,
    setIsLocationModalOpen,
  } = useShop();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      navigateTo('shop', { search: localQuery });
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="bg-[#F7F7F4] border-b border-[#0B2B22]/15 h-[36px] sm:h-[38px] px-3 sm:px-4 flex items-center transition-colors">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Shop Location Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 h-full">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#0B2B22] hover:text-[#AA820A] transition-colors group cursor-pointer h-full"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0B2B22] group-hover:text-[#D4AF37] group-hover:scale-110 transition-all shrink-0" />
            <span className="whitespace-nowrap text-[12px] sm:text-[13px] tracking-tight">Shop Location</span>
          </button>
          
          {/* Thin vertical green divider (1px) between Shop Location and search box */}
          <div className="h-4 w-[1px] bg-[#0B2B22]/25 shrink-0 hidden xs:block sm:block" />
        </div>

        {/* Right: Search Input with Dark Green Button wrapped in one 1.5px #0B2B22 rounded unit */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md flex items-center h-full relative"
        >
          <div className="relative w-full h-[36px] sm:h-[38px] flex items-center rounded-[10px] sm:rounded-[11px] border-[1.5px] border-[#0B2B22] bg-white overflow-hidden transition-all duration-200 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/35 focus-within:shadow-[0_0_12px_rgba(212,175,55,0.3)]">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search for products..."
              className="w-full bg-white text-xs sm:text-sm text-[#0B2B22] placeholder:text-gray-400 pl-3 pr-8 h-full outline-none border-none transition-colors"
            />
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-9 text-gray-400 hover:text-gray-700 p-1 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className="h-full px-3 sm:px-3.5 bg-[#0B2B22] hover:bg-[#06201A] text-[#D4AF37] hover:text-[#FFF3B0] flex items-center justify-center transition-all shrink-0 cursor-pointer active:brightness-95"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

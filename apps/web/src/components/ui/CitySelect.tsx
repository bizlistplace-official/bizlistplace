'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Building, MapPin, ChevronDown, Check, Search, X, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export interface CityItem {
  name: string;
  slug: string;
  countryCode: string;
  stateCode?: string;
  count?: number;
}

export interface CitySelectProps {
  id?: string;
  name?: string;
  value: string; // City name e.g. 'Karachi', 'London', 'New York'
  onChange: (city: string) => void;
  countryCode?: string; // 2-letter ISO e.g. 'PK', 'US', 'GB'
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  required?: boolean;
  allowCustomInput?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero' | 'minimal';
  'aria-label'?: string;
}

// In-memory frontend cache for loaded country cities
const cityCache = new Map<string, CityItem[]>();

function CitySelectComponent({
  id: explicitId,
  name,
  value,
  onChange,
  countryCode,
  placeholder = 'Select City...',
  includeAllOption = false,
  allOptionLabel = 'All Cities',
  disabled = false,
  required = false,
  allowCustomInput = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'auto',
  size = 'md',
  variant = 'default',
  'aria-label': ariaLabel,
}: CitySelectProps) {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const [alignRight, setAlignRight] = useState(align === 'right');

  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize country code
  const normalizedCountry = countryCode ? countryCode.trim().toUpperCase() : '';

  // Load cities when countryCode changes
  useEffect(() => {
    let isCancelled = false;

    if (!normalizedCountry) {
      // If no country specified, we can load general active cities or empty
      setCities([]);
      setLoading(false);
      return;
    }

    if (cityCache.has(normalizedCountry)) {
      setCities(cityCache.get(normalizedCountry)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);

    fetchApi<{ data: CityItem[]; total: number }>(`/locations/cities?country=${encodeURIComponent(normalizedCountry)}`)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && Array.isArray(res.data)) {
          const list = res.data;
          cityCache.set(normalizedCountry, list);
          setCities(list);
        } else {
          setCities([]);
          setLoadError(true);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setCities([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [normalizedCountry]);

  const MAX_DISPLAY_CITIES = 150;

  // Filter cities based on search ONLY when dropdown is open
  const filteredCities = useMemo(() => {
    if (!isOpen || !cities.length) return [];
    if (!searchQuery.trim()) return cities;
    const q = searchQuery.toLowerCase().trim();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.includes(q) ||
        (c.stateCode && c.stateCode.toLowerCase().includes(q))
    );
  }, [isOpen, cities, searchQuery]);

  // Capped visible cities for ultra-fast rendering without UI lockup
  const visibleCities = useMemo(() => {
    if (!isOpen) return [];
    return filteredCities.slice(0, MAX_DISPLAY_CITIES);
  }, [isOpen, filteredCities]);

  // Flattened options for navigation ONLY when dropdown is open
  const flatOptions = useMemo(() => {
    if (!isOpen) return [];
    const list: { name: string; isAll?: boolean; isCustom?: boolean }[] = [];
    if (includeAllOption && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase()))) {
      list.push({ name: '', isAll: true });
    }
    visibleCities.forEach((c) => list.push({ name: c.name }));
    if (allowCustomInput && searchQuery.trim() && !visibleCities.some((c) => c.name.toLowerCase() === searchQuery.toLowerCase().trim())) {
      list.unshift({ name: searchQuery.trim(), isCustom: true });
    }
    return list;
  }, [isOpen, includeAllOption, allOptionLabel, searchQuery, visibleCities, allowCustomInput]);

  // Viewport bounds check without forced reflow
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < 330 && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }

        if (align === 'auto') {
          if (rect.left + 280 > viewportWidth) {
            setAlignRight(true);
          } else {
            setAlignRight(false);
          }
        }
      });

      const focusTimer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(focusTimer);
      };
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, align]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < flatOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
          const item = flatOptions[highlightedIndex];
          onChange(item.name);
          setIsOpen(false);
          triggerRef.current?.focus();
        } else if (allowCustomInput && searchQuery.trim()) {
          onChange(searchQuery.trim());
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll active into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[34px] rounded-lg',
    md: 'text-xs sm:text-sm px-3 py-2.5 min-h-[42px] rounded-xl',
    lg: 'text-sm sm:text-base px-4 py-3 min-h-[48px] rounded-2xl',
  };

  // Variant styles
  const variantStyles = {
    default:
      'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 shadow-xs transition-all duration-150',
    hero:
      'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 transition-all duration-150',
    minimal:
      'bg-slate-50 border border-slate-200/80 text-slate-800 hover:bg-slate-100 hover:border-slate-300 focus-within:bg-white focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 transition-all duration-150',
  };

  const isSelected = Boolean(value);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${isOpen ? 'z-50' : 'z-auto'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for form submits */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 outline-none select-none ${
          sizeStyles[size]
        } ${variantStyles[variant]} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'
        } ${isOpen ? 'border-[#1D68F2] ring-2 ring-[#1D68F2]/20' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />

          {/* City label or prompt */}
          <span
            className={`truncate font-medium text-left ${
              isSelected
                ? 'text-slate-800 font-semibold'
                : includeAllOption && !value
                ? 'text-slate-700 font-medium'
                : 'text-slate-400 font-normal'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D68F2]" />
                <span>Loading cities...</span>
              </span>
            ) : isSelected ? (
              value
            ) : includeAllOption && !value ? (
              allOptionLabel
            ) : !normalizedCountry ? (
              'All Cities'
            ) : (
              placeholder
            )}
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#1D68F2] animate-spin flex-shrink-0" />
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ease-out flex-shrink-0 ${
                isOpen ? 'rotate-180 text-[#1D68F2]' : 'group-hover:text-slate-600'
              }`}
            />
          )}
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={selectId}
          className={`absolute z-[100] min-w-[240px] sm:min-w-[280px] w-full max-w-[calc(100vw-24px)] bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.18)] p-1.5 animate-in fade-in-0 zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${alignRight ? 'right-0' : 'left-0'} ${menuClassName}`}
        >
          {/* Search Header */}
          <div className="relative mb-1.5 pb-1.5 border-b border-slate-100 px-1 pt-0.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={
                  normalizedCountry
                    ? `Search ${cities.length > 0 ? cities.length + ' ' : ''}cities & towns...`
                    : 'Search cities...'
                }
                className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1D68F2] focus:ring-1 focus:ring-[#1D68F2] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* City count header subtitle */}
            {normalizedCountry && cities.length > 0 && !searchQuery && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1 pt-1.5">
                <span>All {cities.length} available cities &amp; towns</span>
                <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                  {normalizedCountry}
                </span>
              </div>
            )}
          </div>

          {/* Cities List */}
          <div
            ref={listRef}
            className="max-h-60 sm:max-h-72 overflow-y-auto space-y-0.5 pr-0.5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent',
            }}
          >
            {/* Optional All Cities button */}
            {includeAllOption && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <button
                data-index="0"
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                  !value
                    ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                    : highlightedIndex === 0
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-base flex-shrink-0 leading-none">🏙️</span>
                  <span className="truncate">{allOptionLabel}</span>
                </div>
                {!value && (
                  <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                )}
              </button>
            )}

            {/* Custom Input Option if allowed and user typed something not in list */}
            {allowCustomInput && searchQuery.trim() && !filteredCities.some((c) => c.name.toLowerCase() === searchQuery.toLowerCase().trim()) && (
              <button
                type="button"
                role="option"
                onClick={() => {
                  onChange(searchQuery.trim());
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left bg-blue-50/50 hover:bg-blue-50 text-[#1D68F2] font-medium transition-all"
              >
                <span className="truncate">
                  Use custom city: <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#1D68F2] font-bold">
                  Custom
                </span>
              </button>
            )}

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#1D68F2]" />
                <span>Loading available cities...</span>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400">
                {searchQuery ? (
                  <>
                    No cities found matching &ldquo;{searchQuery}&rdquo;
                    {allowCustomInput && (
                      <div className="mt-2 text-[11px] text-slate-500">
                        Press Enter to use &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </>
                ) : !normalizedCountry ? (
                  'Please select a country first to view cities'
                ) : (
                  'No cities available for this country'
                )}
              </div>
            ) : (
              <>
                {visibleCities.map((city, idx) => {
                  const itemIdx = (includeAllOption ? 1 : 0) + idx;
                  const isItemActive = value.toLowerCase() === city.name.toLowerCase();
                  const isHighlighted = highlightedIndex === itemIdx;

                  return (
                    <button
                      key={`${city.name}-${city.slug}-${idx}`}
                      data-index={itemIdx}
                      type="button"
                      role="option"
                      aria-selected={isItemActive}
                      onClick={() => {
                        onChange(city.name);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      onMouseEnter={() => setHighlightedIndex(itemIdx)}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                        isItemActive
                          ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                          : isHighlighted
                          ? 'bg-slate-50 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="truncate">{city.name}</span>
                        {city.stateCode && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {city.stateCode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        {typeof city.count === 'number' && city.count > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isItemActive
                                ? 'bg-blue-100 text-[#1D68F2]'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {city.count}
                          </span>
                        )}
                        {isItemActive && (
                          <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredCities.length > MAX_DISPLAY_CITIES && (
                  <div className="py-2 px-3 text-center text-[10px] sm:text-[11px] text-slate-500 border-t border-slate-100 bg-slate-50/80 rounded-xl my-1">
                    Showing top {MAX_DISPLAY_CITIES} of {filteredCities.length.toLocaleString()} locations. Type in search to narrow down.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const CitySelect = React.memo(CitySelectComponent);

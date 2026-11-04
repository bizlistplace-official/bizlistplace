'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { MapPin, ChevronDown, Check, Search, X, Globe } from 'lucide-react';
import { ALL_GLOBAL_COUNTRIES, GlobalCountry } from '@bizpockethub/shared';

// Module-level O(1) indexed maps to avoid repeated O(N) array scans on each render
const countryCodeMap = new Map<string, GlobalCountry>();
const countrySlugMap = new Map<string, GlobalCountry>();
ALL_GLOBAL_COUNTRIES.forEach((c) => {
  countryCodeMap.set(c.code.toUpperCase(), c);
  countrySlugMap.set(c.slug.toLowerCase(), c);
});

export interface CountrySelectProps {
  id?: string;
  name?: string;
  value: string; // ISO 2-letter code e.g. 'PK', 'US', 'GB' or ''
  onChange: (countryCode: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero' | 'minimal';
  'aria-label'?: string;
  hideFlag?: boolean;
  hideCodeBadge?: boolean;
}

function CountrySelectComponent({
  id: explicitId,
  name,
  value,
  onChange,
  placeholder = 'Select Country...',
  includeAllOption = false,
  allOptionLabel = 'All Countries',
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'auto',
  size = 'md',
  variant = 'default',
  'aria-label': ariaLabel,
  hideFlag = false,
  hideCodeBadge = false,
}: CountrySelectProps) {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const [alignRight, setAlignRight] = useState(align === 'right');

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize value for lookup
  const normalizedValue = value ? value.trim().toUpperCase() : '';

  // Currently selected country via O(1) indexed lookup
  const selectedCountry = useMemo(() => {
    if (!normalizedValue) return null;
    return countryCodeMap.get(normalizedValue) || countrySlugMap.get(value.toLowerCase()) || null;
  }, [normalizedValue, value]);

  // Split popular and other countries, then filter by search ONLY when dropdown is open
  const { popularCountries, otherCountries, totalCount } = useMemo(() => {
    if (!isOpen) {
      return { popularCountries: [], otherCountries: [], totalCount: 0 };
    }
    const q = searchQuery.trim().toLowerCase();

    const filterFn = (c: GlobalCountry) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.slug.includes(q)
      );
    };

    const popular = ALL_GLOBAL_COUNTRIES.filter((c) => c.isPopular && filterFn(c));
    const others = ALL_GLOBAL_COUNTRIES.filter((c) => !c.isPopular && filterFn(c));

    return {
      popularCountries: popular,
      otherCountries: others,
      totalCount: popular.length + others.length,
    };
  }, [isOpen, searchQuery]);

  // Flattened list of active options for arrow key navigation ONLY when dropdown is open
  const flatOptions = useMemo(() => {
    if (!isOpen) return [];
    const list: { code: string; label: string; flag?: string }[] = [];
    if (includeAllOption && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase()))) {
      list.push({ code: '', label: allOptionLabel, flag: '🌐' });
    }
    popularCountries.forEach((c) => list.push({ code: c.code, label: c.name, flag: c.flag }));
    otherCountries.forEach((c) => list.push({ code: c.code, label: c.name, flag: c.flag }));
    return list;
  }, [isOpen, includeAllOption, searchQuery, allOptionLabel, popularCountries, otherCountries]);

  // Adjust positioning before opening: check viewport bounds without forced reflow
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
          if (rect.left + 300 > viewportWidth) {
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
    if (disabled) return;

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
          onChange(item.code);
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

  // Scroll active item into view
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

  let globalIndexCounter = 0;

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
          {/* Left Icon or Country Flag */}
          {!hideFlag && (
            selectedCountry ? (
              <span className="text-base flex-shrink-0 leading-none select-none">
                {selectedCountry.flag}
              </span>
            ) : (
              <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )
          )}

          {/* Country Name */}
          <span
            className={`truncate font-medium text-left ${
              selectedCountry
                ? 'text-slate-800 font-semibold'
                : includeAllOption && !value
                ? 'text-slate-700 font-medium'
                : 'text-slate-400 font-normal'
            }`}
          >
            {selectedCountry ? selectedCountry.name : includeAllOption && !value ? allOptionLabel : placeholder}
          </span>
        </div>

        {/* Right Badge and Chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {!hideCodeBadge && selectedCountry && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold font-mono rounded bg-slate-100 text-slate-600 border border-slate-200">
              {selectedCountry.code}
            </span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ease-out flex-shrink-0 ${
              isOpen ? 'rotate-180 text-[#1D68F2]' : 'group-hover:text-slate-600'
            }`}
          />
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
          {/* Sticky Search Header */}
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
                placeholder="Search 250+ countries & territories..."
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
          </div>

          {/* Countries Scrollable List */}
          <div
            ref={listRef}
            className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1 pr-0.5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent',
            }}
          >
            {/* Optional All Countries button */}
            {includeAllOption && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
              const itemIdx = globalIndexCounter++;
              const isSelected = !value;
              const isHighlighted = highlightedIndex === itemIdx;

              return (
                <button
                  key="all-countries-option"
                  data-index={itemIdx}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlightedIndex(itemIdx)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                      : isHighlighted
                      ? 'bg-slate-50 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-base flex-shrink-0 leading-none">🌐</span>
                    <span className="truncate">{allOptionLabel}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                  )}
                </button>
              );
            })()}

            {totalCount === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400">
                No countries found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <>
                {/* Popular Directories Section */}
                {popularCountries.length > 0 && (
                  <div className="space-y-0.5">
                    {!searchQuery && (
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Popular Directories
                      </div>
                    )}
                    {popularCountries.map((country) => {
                      const itemIdx = globalIndexCounter++;
                      const isSelected = normalizedValue === country.code;
                      const isHighlighted = highlightedIndex === itemIdx;

                      return (
                        <button
                          key={country.code}
                          data-index={itemIdx}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(country.code);
                            setIsOpen(false);
                            triggerRef.current?.focus();
                          }}
                          onMouseEnter={() => setHighlightedIndex(itemIdx)}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                              : isHighlighted
                              ? 'bg-slate-50 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-normal'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-base flex-shrink-0 leading-none select-none">
                              {country.flag}
                            </span>
                            <span className="truncate">{country.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                            <span
                              className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                                isSelected
                                  ? 'bg-blue-100/70 border-blue-200 text-[#1D68F2]'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              {country.code}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* All Other Countries Section */}
                {otherCountries.length > 0 && (
                  <div className="space-y-0.5 pt-1">
                    {!searchQuery && popularCountries.length > 0 && (
                      <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                        All Countries &amp; Territories (A–Z)
                      </div>
                    )}
                    {otherCountries.map((country) => {
                      const itemIdx = globalIndexCounter++;
                      const isSelected = normalizedValue === country.code;
                      const isHighlighted = highlightedIndex === itemIdx;

                      return (
                        <button
                          key={country.code}
                          data-index={itemIdx}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(country.code);
                            setIsOpen(false);
                            triggerRef.current?.focus();
                          }}
                          onMouseEnter={() => setHighlightedIndex(itemIdx)}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                              : isHighlighted
                              ? 'bg-slate-50 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-normal'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-base flex-shrink-0 leading-none select-none">
                              {country.flag}
                            </span>
                            <span className="truncate">{country.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                            <span
                              className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                                isSelected
                                  ? 'bg-blue-100/70 border-blue-200 text-[#1D68F2]'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              {country.code}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
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

export const CountrySelect = React.memo(CountrySelectComponent);

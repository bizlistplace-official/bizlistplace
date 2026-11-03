'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  flag?: string;
  badge?: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero' | 'minimal';
  'aria-label'?: string;
  emptyMessage?: string;
}

export function CustomSelect({
  id: explicitId,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  icon,
  searchable,
  searchPlaceholder = 'Search...',
  disabled = false,
  required = false,
  clearable = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'auto',
  size = 'md',
  variant = 'default',
  'aria-label': ariaLabel,
  emptyMessage = 'No options found',
}: CustomSelectProps) {
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

  // Check if search should be enabled
  const isSearchable = searchable ?? options.length > 8;

  // Selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.badge && opt.badge.toLowerCase().includes(q)) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

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

        // If less than 330px below and more space above, open upward
        if (spaceBelow < 330 && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }

        // If near right edge of viewport
        if (align === 'auto') {
          if (rect.left + 260 > viewportWidth) {
            setAlignRight(true);
          } else {
            setAlignRight(false);
          }
        }
      });

      // Focus search input on open if searchable
      let focusTimer: NodeJS.Timeout | undefined;
      if (isSearchable) {
        focusTimer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 30);
      }

      return () => {
        cancelAnimationFrame(rafId);
        if (focusTimer) clearTimeout(focusTimer);
      };
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, isSearchable, align]);

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

  // Handle keyboard navigation
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
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const opt = filteredOptions[highlightedIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
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
      const activeElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Size variations
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[34px] rounded-lg',
    md: 'text-xs sm:text-sm px-3 py-2.5 min-h-[42px] rounded-xl',
    lg: 'text-sm sm:text-base px-4 py-3 min-h-[48px] rounded-2xl',
  };

  // Variant variations
  const variantStyles = {
    default:
      'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 shadow-xs transition-all duration-150',
    hero:
      'bg-white border border-slate-200 text-slate-800 hover:border-slate-300 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 transition-all duration-150',
    minimal:
      'bg-slate-50 border border-slate-200/80 text-slate-800 hover:bg-slate-100 hover:border-slate-300 focus-within:bg-white focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 transition-all duration-150',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${isOpen ? 'z-50' : 'z-auto'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for HTML form support */}
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
          {/* Left Icon / Flag */}
          {selectedOption?.flag ? (
            <span className="text-base flex-shrink-0 leading-none select-none">
              {selectedOption.flag}
            </span>
          ) : selectedOption?.icon ? (
            <span className="text-slate-500 flex-shrink-0 flex items-center">{selectedOption.icon}</span>
          ) : icon ? (
            <span className="text-slate-400 flex-shrink-0 flex items-center">{icon}</span>
          ) : null}

          {/* Selected Label or Placeholder */}
          <span
            className={`truncate font-medium text-left ${
              selectedOption ? 'text-slate-800' : 'text-slate-400 font-normal'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Right Section: Badge, Clear Button & Chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {selectedOption?.badge && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {selectedOption.badge}
            </span>
          )}

          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
              }}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
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
          className={`absolute z-[100] min-w-[200px] w-full max-w-[calc(100vw-24px)] bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.18)] p-1.5 animate-in fade-in-0 zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${alignRight ? 'right-0' : 'left-0'} ${menuClassName}`}
        >
          {/* Search Header if searchable */}
          {isSearchable && (
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
                  placeholder={searchPlaceholder}
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
          )}

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-60 sm:max-h-68 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-all duration-100 outline-none select-none cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#1D68F2] font-semibold'
                        : isHighlighted
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-normal'
                    } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Left Flag or Icon */}
                      {opt.flag ? (
                        <span className="text-base flex-shrink-0 leading-none select-none">
                          {opt.flag}
                        </span>
                      ) : opt.icon ? (
                        <span
                          className={`flex-shrink-0 ${
                            isSelected ? 'text-[#1D68F2]' : 'text-slate-400'
                          }`}
                        >
                          {opt.icon}
                        </span>
                      ) : null}

                      {/* Label & Description */}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate tracking-tight">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[11px] text-slate-400 truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Badge / Checkmark */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                            isSelected
                              ? 'bg-blue-100/70 border-blue-200 text-[#1D68F2]'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#1D68F2] stroke-[2.5] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

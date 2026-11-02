'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  MapPin,
  Home,
  Building2,
  LayoutGrid,
  Globe2,
  Mail,
  Plus,
  Shield,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

const PRIMARY_NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Businesses', icon: Building2 },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
];

const DIRECTORY_ITEMS = [
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan', shortName: 'Pakistan', href: '/pk' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', shortName: 'UK', href: '/uk' },
  { code: 'US', flag: '🇺🇸', name: 'United States', shortName: 'USA', href: '/us' },
];

const SECONDARY_NAV = [
  { href: '/contact', label: 'Contact', icon: Mail },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [directoriesOpen, setDirectoriesOpen] = useState(false);
  const [mobileDirectoriesOpen, setMobileDirectoriesOpen] = useState(false);
  const directoriesRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const openDropdown = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setDirectoriesOpen(true);
  };

  const closeDropdown = (immediate = false) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (immediate) {
      setDirectoriesOpen(false);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setDirectoriesOpen(false);
      }, 180);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Auto-close menus on route change or when expanding window to desktop size
  useEffect(() => {
    setMobileMenuOpen(false);
    closeDropdown(true);
    setMobileDirectoriesOpen(false);
  }, [pathname]);

  // Close directories dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (directoriesRef.current && !directoriesRef.current.contains(e.target as Node)) {
        closeDropdown(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 30);
    } else if (e.key === 'Escape' && directoriesOpen) {
      e.preventDefault();
      closeDropdown(true);
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const totalItems = DIRECTORY_ITEMS.length + 1; // includes "All Directories"
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % totalItems;
      itemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + totalItems) % totalItems;
      itemRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      itemRefs.current[totalItems - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown(true);
      triggerButtonRef.current?.focus();
    } else if (e.key === 'Tab') {
      if ((e.shiftKey && index === 0) || (!e.shiftKey && index === totalItems - 1)) {
        closeDropdown(true);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px] xl:h-[74px] gap-1.5 min-[1040px]:gap-2.5 xl:gap-3">
          {/* Logo with responsive sizing */}
          <Link
            href="/"
            className="flex items-center gap-2 group flex-shrink-0 transition-transform duration-200 active:scale-95"
            aria-label="BizListPlace.com Home"
          >
            <div className="relative w-9 h-9 min-w-[36px] min-h-[36px] min-[1040px]:w-10 min-[1040px]:h-10 xl:w-[42px] xl:h-[42px] rounded-xl overflow-hidden shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-200 border border-blue-100 bg-white flex-shrink-0 flex items-center justify-center">
              <Image
                src="/apple-touch-icon.png"
                alt="BizListPlace.com Logo"
                width={42}
                height={42}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[1.125rem] min-[1040px]:text-[1.25rem] xl:text-[1.35rem] 2xl:text-[1.55rem] font-extrabold tracking-tight text-slate-900 leading-none group-hover:text-slate-950 transition-colors whitespace-nowrap font-jakarta">
                BizListPlace<span className="text-[#1D68F2]">.com</span>
              </span>
            </div>
          </Link>

          {/* Desktop/Laptop Navigation Links - with Directories Dropdown */}
          <nav className="hidden min-[900px]:flex items-center gap-0.5 min-[1040px]:gap-1 xl:gap-1.5 flex-shrink-0">
            {PRIMARY_NAV.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`group relative flex items-center px-2 min-[1040px]:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl text-[0.82rem] min-[1040px]:text-[0.85rem] 2xl:text-[0.9rem] font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-[#1D68F2] bg-blue-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-[#1D68F2] hover:bg-blue-50/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1D68F2] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Directories Dropdown Menu */}
            {(() => {
              const activeDirectory = DIRECTORY_ITEMS.find(
                (item) => pathname === item.href || pathname.startsWith(item.href + '/')
              );
              const isDirectoriesActive = Boolean(activeDirectory) || pathname.startsWith('/countries');

              return (
                <div
                  ref={directoriesRef}
                  className="relative py-1"
                  onMouseEnter={openDropdown}
                  onMouseLeave={() => closeDropdown(false)}
                >
                  <button
                    ref={triggerButtonRef}
                    type="button"
                    id="directories-menu-button"
                    aria-haspopup="menu"
                    aria-expanded={directoriesOpen}
                    aria-controls="directories-menu"
                    onClick={(e) => {
                      e.preventDefault();
                      if (directoriesOpen) {
                        closeDropdown(true);
                      } else {
                        openDropdown();
                      }
                    }}
                    onKeyDown={handleTriggerKeyDown}
                    className={`group relative flex items-center gap-1 min-[1040px]:gap-1.5 px-2 min-[1040px]:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl text-[0.82rem] min-[1040px]:text-[0.85rem] 2xl:text-[0.9rem] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      directoriesOpen
                        ? 'text-[#0F3D39] bg-emerald-50/80 shadow-xs'
                        : isDirectoriesActive
                        ? 'text-[#1D68F2] bg-blue-50/80 shadow-xs'
                        : 'text-slate-700 hover:text-[#0F3D39] hover:bg-slate-50'
                    }`}
                  >
                    <Globe2
                      className={`w-3.5 h-3.5 min-[1040px]:w-4 min-[1040px]:h-4 flex-shrink-0 transition-transform duration-200 ${
                        directoriesOpen
                          ? 'text-[#0F3D39] scale-110'
                          : isDirectoriesActive
                          ? 'text-[#1D68F2]'
                          : 'text-slate-500 group-hover:text-[#0F3D39]'
                      }`}
                    />
                    <span className={directoriesOpen ? 'text-[#0F3D39]' : ''}>
                      {activeDirectory ? `${activeDirectory.flag} ${activeDirectory.shortName}` : 'Directories'}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 min-[1040px]:w-3.5 min-[1040px]:h-3.5 flex-shrink-0 transition-transform duration-200 ${
                        directoriesOpen
                          ? 'rotate-180 text-[#0F3D39]'
                          : 'text-slate-400 group-hover:text-[#0F3D39]'
                      }`}
                    />
                    {isDirectoriesActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1D68F2] rounded-full" />
                    )}
                  </button>

                  {/* Dropdown Menu - Continuous Hover Bridge with padding & invisible connector */}
                  {directoriesOpen && (
                    <div
                      id="directories-menu"
                      role="menu"
                      aria-labelledby="directories-menu-button"
                      onMouseEnter={openDropdown}
                      onMouseLeave={() => closeDropdown(false)}
                      className="absolute top-full left-0 pt-1.5 w-60 z-50 pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-150"
                    >
                      {/* Invisible Hover Bridge directly overlapping trigger button */}
                      <div className="absolute -top-2.5 left-0 right-0 h-3 pointer-events-auto" />

                      {/* Dropdown Card */}
                      <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-2">
                        <div className="space-y-1 px-1.5">
                          {DIRECTORY_ITEMS.map((item, index) => {
                            const isActive =
                              pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                              <Link
                                key={item.code}
                                prefetch={true}
                                ref={(el) => {
                                  itemRefs.current[index] = el;
                                }}
                                role="menuitem"
                                href={item.href}
                                onClick={() => closeDropdown(true)}
                                onKeyDown={(e) => handleItemKeyDown(e, index)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 outline-none focus:ring-2 focus:ring-[#1D68F2]/30 ${
                                  isActive
                                    ? 'bg-blue-50 text-[#1D68F2] font-bold shadow-xs'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                              >
                                <span className="text-base flex-shrink-0 leading-none">{item.flag}</span>
                                <span className="w-5 text-xs font-bold text-slate-500 tracking-wide">
                                  {item.code}
                                </span>
                                <span className="text-sm font-semibold text-slate-800 tracking-tight flex-1">
                                  {item.name}
                                </span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D68F2] flex-shrink-0" />
                                )}
                              </Link>
                            );
                          })}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                          <Link
                            prefetch={true}
                            ref={(el) => {
                              itemRefs.current[DIRECTORY_ITEMS.length] = el;
                            }}
                            role="menuitem"
                            href="/countries"
                            onClick={() => closeDropdown(true)}
                            onKeyDown={(e) => handleItemKeyDown(e, DIRECTORY_ITEMS.length)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#1D68F2] hover:bg-blue-50/70 rounded-xl transition-colors outline-none focus:ring-2 focus:ring-[#1D68F2]/30"
                          >
                            <span>All Directories</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              250+ Countries &rarr;
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {SECONDARY_NAV.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`group relative flex items-center px-2 min-[1040px]:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl text-[0.82rem] min-[1040px]:text-[0.85rem] 2xl:text-[0.9rem] font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-[#1D68F2] bg-blue-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-[#1D68F2] hover:bg-blue-50/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1D68F2] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons - securely contained within header on all screen sizes */}
          <div className="hidden min-[900px]:flex items-center gap-1 min-[1040px]:gap-1.5 xl:gap-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-1 min-[1040px]:gap-1.5 xl:gap-2">
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2 min-[1040px]:px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all hover:shadow-xs whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-2.5 min-[1040px]:px-3 xl:px-3.5 py-1.5 xl:py-2 text-[0.82rem] min-[1040px]:text-[0.85rem] xl:text-[0.88rem] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 min-[1040px]:w-4 min-[1040px]:h-4 text-slate-500" />
                  <span className="hidden min-[960px]:inline">Dashboard</span>
                </Link>

                <Link
                  href="/add-business"
                  className="flex items-center gap-1 min-[1040px]:gap-1.5 px-2.5 min-[1040px]:px-3.5 xl:px-4 py-1.5 xl:py-2 text-[0.82rem] min-[1040px]:text-[0.85rem] xl:text-[0.88rem] font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 xl:w-4 xl:h-4 stroke-[2.5]" />
                  <span>Add Business</span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-1.5 min-[1040px]:p-2 text-slate-500 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 xl:w-[18px] xl:h-[18px]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 min-[1040px]:gap-1.5 xl:gap-2">
                <Link
                  href="/login"
                  className="px-2.5 min-[1040px]:px-3.5 py-1.5 xl:py-2 text-[0.82rem] min-[1040px]:text-[0.85rem] xl:text-[0.88rem] font-semibold text-slate-700 hover:text-[#1D68F2] hover:bg-blue-50/50 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  Log in
                </Link>

                <Link
                  href="/login?redirect=/add-business"
                  className="flex items-center gap-1 min-[1040px]:gap-1.5 px-2.5 min-[1040px]:px-3.5 xl:px-4 py-1.5 xl:py-2 text-[0.82rem] min-[1040px]:text-[0.85rem] xl:text-[0.88rem] font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 xl:w-4 xl:h-4 stroke-[2.5]" />
                  <span>Add Business</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Toggle Area (<900px) */}
          <div className="flex min-[900px]:hidden items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                <Link
                  href="/add-business"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Business</span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95 cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#1D68F2] hover:bg-blue-50/50 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/add-business"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Business</span>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-[#1D68F2] transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 cursor-pointer"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (<900px) */}
      {mobileMenuOpen && (
        <div className="min-[900px]:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 sm:px-6 pt-3 pb-6 space-y-1.5 max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-72px)] overflow-y-auto shadow-xl transition-all">
          {PRIMARY_NAV.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#1D68F2] bg-blue-50'
                    : 'text-slate-700 hover:text-[#1D68F2] hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#1D68F2]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile Directories Accordion */}
          <div className="rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileDirectoriesOpen(!mobileDirectoriesOpen)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith('/countries')
                  ? 'text-[#1D68F2] bg-blue-50'
                  : 'text-slate-700 hover:text-[#1D68F2] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe2
                  className={`w-4 h-4 ${
                    pathname.startsWith('/countries') ||
                    pathname === '/pk' ||
                    pathname.startsWith('/pk/') ||
                    pathname === '/us' ||
                    pathname.startsWith('/us/') ||
                    pathname === '/uk' ||
                    pathname.startsWith('/uk/')
                      ? 'text-[#1D68F2]'
                      : 'text-slate-400'
                  }`}
                />
                <span>Directories</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  mobileDirectoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileDirectoriesOpen && (
              <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-50/80 rounded-xl mt-1">
                {DIRECTORY_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.code}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isActive
                          ? 'text-[#1D68F2] bg-blue-50/80 font-bold'
                          : 'text-slate-700 hover:text-[#1D68F2]'
                      }`}
                    >
                      <span className="text-sm leading-none">{item.flag}</span>
                      <span className="w-5 font-bold text-slate-400">{item.code}</span>
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D68F2]" />
                      )}
                    </Link>
                  );
                })}
                <Link
                  href="/countries"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-bold text-[#1D68F2] hover:underline"
                >
                  All Directories (250+ Countries & Territories) &rarr;
                </Link>
              </div>
            )}
          </div>

          {SECONDARY_NAV.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#1D68F2] bg-blue-50'
                    : 'text-slate-700 hover:text-[#1D68F2] hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#1D68F2]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <div className="px-1 py-1 text-xs text-slate-500">
                  Signed in as <strong>{user.email}</strong> ({user.role})
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-xl"
                  >
                    Admin Moderation Portal
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/add-business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 text-center text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Add Business</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full py-2 text-center text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold border border-slate-300 text-slate-800 hover:border-[#1D68F2] hover:text-[#1D68F2] rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/login?redirect=/add-business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 text-center py-2.5 text-xs font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Business</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

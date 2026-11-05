import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://bizlistplace.com';

export function Breadcrumbs({
  items,
  className = '',
  includeHome = true,
  homeLabel = 'Home',
  homeHref = '/',
}: BreadcrumbsProps) {
  // Construct full list including Home if requested
  const allItems: BreadcrumbItem[] = includeHome
    ? [{ label: homeLabel, href: homeHref }, ...items]
    : items;

  if (!allItems || allItems.length === 0) return null;

  // Generate Schema.org JSON-LD BreadcrumbList structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      const position = index + 1;
      const isLast = index === allItems.length - 1;

      // Base absolute URL for schema
      const itemUrl = item.href
        ? item.href.startsWith('http')
          ? item.href
          : `${SITE_URL}${item.href.startsWith('/') ? '' : '/'}${item.href}`
        : undefined;

      const listItem: Record<string, any> = {
        '@type': 'ListItem',
        position,
        name: item.label,
      };

      if (!isLast && itemUrl) {
        listItem.item = itemUrl;
      }

      return listItem;
    }),
  };

  return (
    <>
      {/* Schema.org BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-medium text-slate-500">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0"
              >
                {index > 0 && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}

                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    prefetch={true}
                    className="hover:text-slate-900 transition-colors inline-flex items-center gap-1 truncate max-w-[140px] sm:max-w-[200px]"
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-md"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}


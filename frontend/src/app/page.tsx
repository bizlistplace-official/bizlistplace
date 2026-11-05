import React from 'react';
import { Metadata } from 'next';
import { HomeContent } from '@/components/home/HomeContent';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'BizListPlace — Find Trusted Businesses Near You or Worldwide',
  description:
    'Discover verified businesses, services, shops, and companies across 195+ countries worldwide on BizListPlace. Free business listings, reviews, and direct contacts.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomeContent />;
}

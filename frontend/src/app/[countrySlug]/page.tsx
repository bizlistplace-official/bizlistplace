import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountryConfig } from '@/lib/countryConfig';
import { HomeContent } from '@/components/home/HomeContent';

interface CountryHomePageProps {
  params: Promise<{ countrySlug: string }>;
}

export const revalidate = 120;

export async function generateMetadata({
  params,
}: CountryHomePageProps): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = getCountryConfig(countrySlug);

  if (!country) {
    return {
      title: 'Directory Not Found — BizListPlace',
    };
  }

  return {
    title: country.seo.title,
    description: country.seo.description,
    keywords: [
      `${country.name} business directory`,
      `${country.demonym} companies`,
      `businesses in ${country.name}`,
      `${country.name} local services`,
      `free business listing ${country.name}`,
    ],
    alternates: {
      canonical: `/${country.routeCode}`,
    },
    openGraph: {
      title: country.seo.title,
      description: country.seo.description,
      url: `/${country.routeCode}`,
      siteName: 'BizListPlace',
      type: 'website',
    },
  };
}

export default async function CountryHomePage({ params }: CountryHomePageProps) {
  const { countrySlug } = await params;
  const country = getCountryConfig(countrySlug);

  if (!country) {
    notFound();
  }

  return <HomeContent country={country} />;
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../modules/users/user.model';
import { Category } from '../modules/categories/category.model';
import { Business } from '../modules/businesses/business.model';
import { BusinessLocation } from '../modules/businesses/businessLocation.model';
import { Review } from '../modules/reviews/review.model';
import { INITIAL_CATEGORIES } from '@bizpockethub/shared';

export async function seed(disconnect = true) {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Seed script cannot be run in production mode.');
    process.exit(1);
  }

  console.log('🌱 Starting Biz List Place database seed...');
  await connectDB();

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Business.deleteMany({}),
    BusinessLocation.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('✓ Cleared old development collections');

  // 1. Seed Users
  const passwordSalt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('AdminPass123!', passwordSalt);
  const ownerPassword = await bcrypt.hash('OwnerPass123!', passwordSalt);
  const userPassword = await bcrypt.hash('UserPass123!', passwordSalt);

  const admin = await User.create({
    name: 'Directory Administrator',
    email: 'admin@bizlistplace.com',
    passwordHash: adminPassword,
    role: 'admin',
    accountStatus: 'active',
    emailVerifiedAt: new Date(),
  });

  const owner = await User.create({
    name: 'Sarah Jenkins',
    email: 'owner@bizlistplace.com',
    passwordHash: ownerPassword,
    role: 'business_owner',
    accountStatus: 'active',
    emailVerifiedAt: new Date(),
  });

  const user = await User.create({
    name: 'Michael Chen',
    email: 'user@bizlistplace.com',
    passwordHash: userPassword,
    role: 'user',
    accountStatus: 'active',
    emailVerifiedAt: new Date(),
  });

  console.log('✓ Created seed accounts (Admin, Business Owner, User)');

  // 2. Seed Categories
  const categoryDocs = await Category.insertMany(
    INITIAL_CATEGORIES.map((c) => ({
      ...c,
      isActive: true,
    }))
  );
  console.log(`✓ Seeded ${categoryDocs.length} primary business categories`);

  const catMap = new Map<string, mongoose.Types.ObjectId>();
  categoryDocs.forEach((c) => catMap.set(c.slug, c._id as mongoose.Types.ObjectId));

  // 3. Seed Clearly Identified Fictional Global Businesses
  const demoBusinesses = [
    {
      name: 'Apex Cloud Solutions',
      slug: 'apex-cloud-solutions',
      categorySlug: 'technology-software',
      description:
        'Apex Cloud Solutions provides enterprise multi-cloud orchestration, zero-trust cybersecurity architectures, and managed DevOps consulting for international enterprises. [Fictional Demo Listing for testing directory functionality].',
      shortDescription: 'Enterprise cloud infrastructure, cybersecurity & DevOps consulting.',
      website: 'https://example-apexcloud.demo',
      contactEmail: 'contact@example-apexcloud.demo',
      phone: '+1 (555) 019-2831',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      verificationNotes: 'Verified via Corporate Registry filing and DNS domain validation.',
      isFeatured: true,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Global Headquarters',
        branchSlug: 'new-york-hq',
        countryCode: 'US',
        countryName: 'United States',
        region: 'New York',
        city: 'New York',
        postalCode: '10001',
        addressLine1: '350 5th Avenue, Suite 4200',
        phone: '+1 (555) 019-2831',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [-73.9857, 40.7484] },
      },
      secondaryLocations: [
        {
          branchName: 'European Regional Branch',
          branchSlug: 'london-branch',
          countryCode: 'GB',
          countryName: 'United Kingdom',
          region: 'Greater London',
          city: 'London',
          postalCode: 'EC2A 4NE',
          addressLine1: '25 Finsbury Circus',
          phone: '+44 20 7946 0912',
          isPrimary: false,
          coordinates: { type: 'Point' as const, coordinates: [-0.0877, 51.5186] },
        },
      ],
    },
    {
      name: 'Kensington Global Advisory',
      slug: 'kensington-global-advisory',
      categorySlug: 'legal-financial',
      description:
        'Kensington Global Advisory delivers cross-border M&A counsel, international tax planning, and statutory compliance audits for multinational organizations. [Fictional Demo Listing].',
      shortDescription: 'International corporate law, cross-border M&A, and fiscal advisory.',
      website: 'https://example-kensington.demo',
      contactEmail: 'advisory@example-kensington.demo',
      phone: '+44 20 7123 4567',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      verificationNotes: 'Verified with Law Society registration documentation.',
      isFeatured: true,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Mayfair Chambers',
        branchSlug: 'london-mayfair',
        countryCode: 'GB',
        countryName: 'United Kingdom',
        region: 'Greater London',
        city: 'London',
        postalCode: 'W1J 8DY',
        addressLine1: '40 Berkeley Square',
        phone: '+44 20 7123 4567',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [-0.1472, 51.5103] },
      },
    },
    {
      name: 'Pacific Robotics & Automation',
      slug: 'pacific-robotics-automation',
      categorySlug: 'manufacturing-industrial',
      description:
        'Specializing in robotic assembly lines, industrial sensor telemetry, and smart warehouse logistics systems for tier-1 automotive and aerospace clients. [Fictional Demo Listing].',
      shortDescription: 'Industrial automation, robotic assembly lines & sensor telemetry.',
      website: 'https://example-pacific-robotics.demo',
      contactEmail: 'info@example-pacific-robotics.demo',
      phone: '+1 (416) 555-0188',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      isFeatured: true,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Toronto Tech Park',
        branchSlug: 'toronto-main',
        countryCode: 'CA',
        countryName: 'Canada',
        region: 'Ontario',
        city: 'Toronto',
        postalCode: 'M5H 2N2',
        addressLine1: '100 King Street West',
        phone: '+1 (416) 555-0188',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [-79.3828, 43.6489] },
      },
    },
    {
      name: 'Al-Noor Trade & Logistics',
      slug: 'al-noor-trade-logistics',
      categorySlug: 'automotive-transport',
      description:
        'Premier Middle East freight forwarding, customs brokerage, and refrigerated cold-chain transport operating across the GCC. [Fictional Demo Listing].',
      shortDescription: 'Freight forwarding, cold chain logistics, and customs clearance.',
      website: 'https://example-alnoor-trade.demo',
      contactEmail: 'operations@example-alnoor-trade.demo',
      phone: '+971 4 888 1234',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      isFeatured: true,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Dubai Logistics City HQ',
        branchSlug: 'dubai-hq',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        region: 'Dubai',
        city: 'Dubai',
        postalCode: '00000',
        addressLine1: 'Sheikh Zayed Road, Trade Centre 2',
        phone: '+971 4 888 1234',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [55.2831, 25.2285] },
      },
    },
    {
      name: 'Indus Creative Digital Agency',
      slug: 'indus-creative-digital',
      categorySlug: 'professional-services',
      description:
        'Award-winning product design, mobile app engineering, performance marketing, and branding services for international venture-backed startups. [Fictional Demo Listing].',
      shortDescription: 'Full-cycle UI/UX product design, mobile apps & performance marketing.',
      website: 'https://example-indus-creative.demo',
      contactEmail: 'hello@example-indus-creative.demo',
      phone: '+92 42 3578 9911',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      isFeatured: false,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Gulberg Innovation Hub',
        branchSlug: 'lahore-main',
        countryCode: 'PK',
        countryName: 'Pakistan',
        region: 'Punjab',
        city: 'Lahore',
        postalCode: '54000',
        addressLine1: 'Main Boulevard, Gulberg III',
        phone: '+92 42 3578 9911',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [74.3587, 31.5204] },
      },
    },
    {
      name: 'St. Jude International Medical Clinic',
      slug: 'st-jude-international-medical',
      categorySlug: 'healthcare-medical',
      description:
        'Comprehensive family medicine, specialized cardiology consultations, outpatient diagnostics, and telemedicine services. [Fictional Demo Listing].',
      shortDescription: 'Multi-specialty outpatient diagnostics, cardiology & family healthcare.',
      website: 'https://example-stjude-clinic.demo',
      contactEmail: 'reception@example-stjude.demo',
      phone: '+61 2 9876 5432',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      isFeatured: false,
      ownerId: null, // Unclaimed listing for claim testing!
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Sydney Central Clinic',
        branchSlug: 'sydney-central',
        countryCode: 'AU',
        countryName: 'Australia',
        region: 'New South Wales',
        city: 'Sydney',
        postalCode: '2000',
        addressLine1: '120 Elizabeth Street',
        phone: '+61 2 9876 5432',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [151.2093, -33.8688] },
      },
    },
    {
      name: 'Bavaria Green Energy Engineering',
      slug: 'bavaria-green-energy',
      categorySlug: 'construction-real-estate',
      description:
        'Commercial solar photovoltaic installations, industrial heat-recovery systems, and energy efficiency retrofits for European industrial parks. [Fictional Demo Listing].',
      shortDescription: 'Turnkey industrial solar installations & energy retrofits.',
      website: 'https://example-bavaria-energy.demo',
      contactEmail: 'projects@example-bavaria-energy.demo',
      phone: '+49 89 1234 5678',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'unverified' as const,
      isFeatured: false,
      ownerId: null, // Unclaimed listing
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'Munich Head Office',
        branchSlug: 'munich-hq',
        countryCode: 'DE',
        countryName: 'Germany',
        region: 'Bavaria',
        city: 'Munich',
        postalCode: '80331',
        addressLine1: 'Maximilianstraße 35',
        phone: '+49 89 1234 5678',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [11.582, 48.139] },
      },
    },
    {
      name: 'Nordic Culinary Bistro & Bakery',
      slug: 'nordic-culinary-bistro',
      categorySlug: 'restaurants-hospitality',
      description:
        'Artisanal sourdough bakery, organic Nordic brunch dining, and private event catering using farm-to-table seasonal produce. [Fictional Demo Listing].',
      shortDescription: 'Artisanal organic bakery, cafe, and farm-to-table bistro.',
      website: 'https://example-nordic-bistro.demo',
      contactEmail: 'table@example-nordic-bistro.demo',
      phone: '+1 (312) 555-0199',
      businessType: 'physical' as const,
      listingStatus: 'published' as const,
      verificationStatus: 'verified' as const,
      isFeatured: false,
      ownerId: owner._id,
      publishedAt: new Date(),
      primaryLocation: {
        branchName: 'West Loop Location',
        branchSlug: 'chicago-west-loop',
        countryCode: 'US',
        countryName: 'United States',
        region: 'Illinois',
        city: 'Chicago',
        postalCode: '60607',
        addressLine1: '820 W Randolph Street',
        phone: '+1 (312) 555-0199',
        isPrimary: true,
        coordinates: { type: 'Point' as const, coordinates: [-87.649, 41.884] },
      },
    },
  ];

  for (const bData of demoBusinesses) {
    const catId = catMap.get(bData.categorySlug);
    const business = await Business.create({
      name: bData.name,
      slug: bData.slug,
      categoryIds: catId ? [catId] : [],
      description: bData.description,
      shortDescription: bData.shortDescription,
      website: bData.website,
      contactEmail: bData.contactEmail,
      phone: bData.phone,
      businessType: bData.businessType,
      countryCode: (bData as any).countryCode || bData.primaryLocation.countryCode,
      listingStatus: bData.listingStatus,
      verificationStatus: bData.verificationStatus,
      verificationNotes: (bData as any).verificationNotes || '',
      isFeatured: bData.isFeatured,
      ownerId: bData.ownerId,
      publishedAt: bData.publishedAt,
      ratingAverage: 4.8,
      reviewCount: 2,
    });

    // Create primary location
    await BusinessLocation.create({
      businessId: business._id,
      ...bData.primaryLocation,
    });

    // Create secondary locations if any
    if ((bData as any).secondaryLocations) {
      for (const secLoc of (bData as any).secondaryLocations) {
        await BusinessLocation.create({
          businessId: business._id,
          ...secLoc,
        });
      }
    }

    // Create sample approved reviews
    await Review.create({
      businessId: business._id,
      userId: user._id,
      rating: 5,
      title: 'Outstanding professionalism and service',
      content:
        'We contracted their team for an international project and were thoroughly impressed with their turnaround time, clear communication, and subject-matter expertise. Highly recommended!',
      moderationStatus: 'approved',
    });

    await Review.create({
      businessId: business._id,
      userId: admin._id,
      rating: 4,
      title: 'Reliable and responsive team',
      content:
        'Transparent engagement and high attention to detail throughout our collaboration. Great to see verified listings of this caliber on Biz List Place.',
      moderationStatus: 'approved',
    });
  }

  console.log(`✓ Seeded ${demoBusinesses.length} verified and demo businesses across 7 countries`);
  console.log('🎉 Seed complete! Development environment is ready.');
  if (disconnect) {
    await disconnectDB();
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seed.ts')) {
  seed(true).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

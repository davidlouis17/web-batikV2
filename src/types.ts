/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Batik Tradisional' | 'Batik Modern' | 'Batik Kontemporer' | 'Aksesoris Batik';
  images: string[];
  status: 'Tersedia' | 'Habis';
  displayOrder: number;
  philosophy?: string;
  isPopular?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  location: string;
  status: 'Mendatang' | 'Selesai';
  type: 'Festival Batik Nasional' | 'Workshop Batik Tulis' | 'Pameran Batik Kontemporer' | 'Pelatihan Pengrajin';
  registrationLink?: string;
  registrantsCount?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo?: string;
  rating: number;
  status: 'Aktif' | 'Tidak aktif';
}

export interface Subscriber {
  id: string;
  email: string;
  subscribeDate: string;
}

export interface WebsiteSettings {
  siteTitle: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  metaTags: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  footerCopyright: string;
  // Content Management: Section 6 (Stage Hero Wide Banner)
  stageBannerTitle?: string;
  stageBannerSubtitle?: string;
  stageBannerDescription?: string;
  stageBannerImageUrl?: string;
  // Content Management: Section 2 (Pilar Utama & Category Showcase)
  aboutTitle?: string;
  aboutSubtitle?: string;
  pillar1Title?: string;
  pillar1Desc?: string;
  pillar2Title?: string;
  pillar2Desc?: string;
  pillar3Title?: string;
  pillar3Desc?: string;
  pillar4Title?: string;
  pillar4Desc?: string;
  showcase1Title?: string;
  showcase1Subtitle?: string;
  showcase1ImageUrl?: string;
  showcase2Title?: string;
  showcase2Subtitle?: string;
  showcase2ImageUrl?: string;
  showcase3Title?: string;
  showcase3Subtitle?: string;
  showcase3ImageUrl?: string;
  // Content Management: Section 4 (Filosofi Batik Jawa Timur)
  philoSubtitle?: string;
  philoTitle?: string;
  philoDescription?: string;
  philoGroupSubtitle?: string;
  philoGroupTitle?: string;
  philoGroupImageUrl?: string;
  // Content Management: Section 1 (Hero & Welcome Showcase)
  heroBadge?: string;
  heroTitle?: string;
  // Content Management: Section 3, 5, 7, 8 Header Labels
  catalogSubtitle?: string;
  catalogTitle?: string;
  bestsellersSubtitle?: string;
  bestsellersTitle?: string;
  testiSubtitle?: string;
  testiTitle?: string;
  recomSubtitle?: string;
  recomTitle?: string;
  eventsSubtitle?: string;
  eventsTitle?: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  popularPages: { path: string; title: string; views: number }[];
  catalogConversions: { name: string; clicks: number; purchases: number }[];
  eventStats: { eventId: string; title: string; limit: number; registered: number }[];
}

export interface GalleryPhoto {
  id: string;
  url: string;
}

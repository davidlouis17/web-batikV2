/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Event, Testimonial, WebsiteSettings, AnalyticsData, Subscriber } from '../types';

// Let's use gorgeous Unsplash images curated for Indonesian / Javanese / Batik context
export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Batik Mega Mendung',
    description: 'Batik tulis dengan motif awan khas Cirebon yang melambangkan kesabaran dan kesejukan jiwa.',
    price: 275000,
    category: 'Batik Tradisional',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 1,
    philosophy: 'Awan pembawa hujan melambangkan kesuburan dan pemberi kehidupan bagi masyarakat Jawa.',
    isPopular: true
  },
  {
    id: 'prod-2',
    name: 'Batik Parang',
    description: 'Motif batik parang melambangkan jalinan yang tidak pernah putus, perjuangan, kesucian, dan kekuatan.',
    price: 180000,
    category: 'Batik Tradisional',
    images: [
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 2,
    philosophy: 'Garis diagonal menggambarkan ombak yang bergulung, melambangkan semangat juang ksatria Jawa Jawa Timur yang tak kenal menyerah.',
    isPopular: true
  },
  {
    id: 'prod-3',
    name: 'Batik Kawung',
    description: 'Motif empat bulatan oval dengan pusat di tengah yang melambangkan keadilan, kemurnian, dan pengendalian diri.',
    price: 200000,
    category: 'Batik Tradisional',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 3,
    philosophy: 'Menyerupai buah kolang-kaling yang tersusun rapi, melambangkan struktur kepemimpinan yang adil dan seimbang di masa kejayaan Jawa.',
    isPopular: true
  },
  {
    id: 'prod-4',
    name: 'Batik Truntum',
    description: 'Motif taburan bintang di langit malam, melambangkan cinta kasih yang tulus, bersemi kembali, dan menuntun.',
    price: 150000,
    category: 'Batik Tradisional',
    images: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 4,
    philosophy: 'Kisah Ratu Kencono yang merasa diabaikan Raja, lalu membatik motif bintang yang indah ini hingga cinta Raja tumbuh kembali.',
    isPopular: true
  },
  {
    id: 'prod-5',
    name: 'Batik Lasem',
    description: 'Perpaduan akulturasi budaya Tionghoa dan Jawa Timur dengan warna merah menyala yang legendaris.',
    price: 175000,
    category: 'Batik Modern',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 5,
    philosophy: 'Warna abang getih pitik melambangkan keberuntungan, kemakmuran, dan keharmonisan multikultural.',
    isPopular: true
  },
  {
    id: 'prod-6',
    name: 'Batik Sawunggaling',
    description: 'Menampilkan keindahan burung legendaris maskot Surabaya, perlambang kejantanan, kebenaran, dan semangat pantang kalah.',
    price: 220000,
    category: 'Batik Modern',
    images: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 6,
    philosophy: 'Burung Sawunggaling melambangkan tekad kuat arek-arek Jawa Timur dalam memenangkan perjuangan hidup secara mulia.',
    isPopular: false
  },
  {
    id: 'prod-7',
    name: 'Batik Tambal',
    description: 'Kombinasi harmonis berbagai macam motif batik tradisional dalam satu lembar kain, melambangkan penyembuhan.',
    price: 165000,
    category: 'Batik Kontemporer',
    images: [
      'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 7,
    philosophy: 'Menambal sesuatu yang rusak, melambangkan harapan agar yang sakit segera sembuh dan kembali sejahtera lahir batin.',
    isPopular: false
  },
  {
    id: 'prod-8',
    name: 'Batik Nitik',
    description: 'Motif batik geometris yang tersusun dari ribuan titik-titik kecil menyerupai tenunan anyaman kain lurik.',
    price: 190000,
    category: 'Aksesoris Batik',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Tersedia',
    displayOrder: 8,
    philosophy: 'Melambangkan keuletan, ketelitian, dan penghormatan tinggi pada detail-detail kecil dalam kehidupan bermasyarakat.',
    isPopular: false
  }
];

export const initialEvents: Event[] = [
  {
    id: 'ev-1',
    title: 'FESTIVAL BATIK NASIONAL 2024',
    date: '2026-07-27',
    description: 'Dokumentasi lengkap Festival Batik Nasional yang menampilkan karya-karya terbaik dari pengrajin batik Jawa Timur. Acara ini merupakan puncak perayaan budaya yang dihadiri ribuan delegasi nasional dan internasional.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
    location: 'Graha Sawunggaling UNESA, Surabaya',
    status: 'Mendatang',
    type: 'Festival Batik Nasional',
    registrationLink: 'https://batikjatim.org/daftar-festival',
    registrantsCount: 245
  },
  {
    id: 'ev-2',
    title: 'WORKSHOP BATIK TULIS TRADISIONAL',
    date: '2026-06-11',
    description: 'Pelatihan intensif pembuatan batik tulis dengan teknik klasik yang telah diwariskan turun-temurun. Peserta diajarkan cara memegang canting, melelehkan malam, hingga pewarnaan alami indigo.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
    location: 'Sentra Batik Tulis Bangkalan, Madura',
    status: 'Selesai',
    type: 'Workshop Batik Tulis',
    registrationLink: '',
    registrantsCount: 45
  },
  {
    id: 'ev-3',
    title: 'PAMERAN BATIK KONTEMPORER',
    date: '2026-05-18',
    description: 'Eksplorasi batik modern dengan sentuhan kontemporer dari seniman muda Jawa Timur. Menunjukkan bagaimana tradisi klasik dapat disandingkan secara harmonis di era busana modern global.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
    location: 'Museum Batik Danar Hadi, Solo & Surabaya Hall',
    status: 'Selesai',
    type: 'Pameran Batik Kontemporer',
    registrationLink: '',
    registrantsCount: 120
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'AHMAD SANTOSO',
    role: 'Pecinta Batik & Kolektor Seni',
    content: 'Batik Jawa Timur memiliki kualitas luar biasa. Motifnya indah dan filosofinya mendalam. Saya bangga memiliki koleksi batik asli dari sentra-sentra terkemuka.',
    rating: 5,
    status: 'Aktif'
  },
  {
    id: 'test-2',
    name: 'MAYA SARI',
    role: 'Desainer Busana Tradisional',
    content: 'Kerja sama dengan pengrajin dari berbagai sentra di Jawa Timur sangat menginspirasi. Setiap pembelian saya selalu puas dengan keindahan batik asli dan layanan dari komunitas ini.',
    rating: 5,
    status: 'Aktif'
  },
  {
    id: 'test-3',
    name: 'RUDY HERMAWAN',
    role: 'Duta Budaya Mahasiswa Jawa Timur',
    content: 'Bergabung dalam workshop yang diadakan Ikatan Putera Puteri Batik membuka mata saya mengenai kekayaan nilai luhur bangsa kita yang tertuang di tiap helai kain batik tulis.',
    rating: 4,
    status: 'Aktif'
  }
];

export const initialSettings: WebsiteSettings = {
  siteTitle: 'Ikatan Putera Puteri Batik Jawa Timur',
  siteDescription: 'Preservasi, Promosi, dan Kreasi Warisan Budaya Batik Jawa Timur. Menjaga dan mempromosikan warisan luhur bangsa untuk generasi cerdas masa kini.',
  logoUrl: '',
  faviconUrl: '',
  metaTags: 'batik, jawa timur, putera puteri batik, budaya, indonesia, surabaya, workshop batik',
  socialMedia: {
    instagram: '@puteraputeribatikjatim',
    facebook: 'Putera Puteri Batik Jatim',
    twitter: '@batikjatim',
    youtube: 'Ikatan Putera Puteri Batik Jatim',
    linkedin: 'Ikatan Putera Puteri Batik Jatim'
  },
  contactInfo: {
    email: 'info@batikjatim.org',
    phone: '+62 31 123 4567',
    address: 'Jl. Pemuda No. 12-14, Embong Kaliasin, Kec. Genteng, Surabaya, Jawa Timur 60271'
  },
  footerCopyright: '© 2026 Ikatan Putera Puteri Batik Jawa Timur. All Rights Reserved.',
  // Content defaults
  stageBannerTitle: 'Mewadahi Talenta Muda Kreatif Untuk Budaya Berharga',
  stageBannerSubtitle: 'GRAND FINAL SELECTION',
  stageBannerDescription: 'Momen bersejarah penganugerahan Putera Puteri Batik Jatim, menjembatani kolaborasi pengrajin daerah dan pasar modern internasional.',
  stageBannerImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400',
  
  aboutTitle: 'Sejarah & Perjuangan Batik Jawa Timur',
  aboutSubtitle: 'PILAR UTAMA ASOSIASI',
  pillar1Title: 'Workshop Batik',
  pillar1Desc: 'Ikuti workshop pembuatan batik tradisional dan modern bersama pengrajin berpengalaman di berbagai sentra daerah.',
  pillar2Title: 'Katalog Produk',
  pillar2Desc: 'Jelajahi koleksi batik berkualitas dari berbagai sentra batik di Jawa Timur yang didesain secara unik dan penuh estetika.',
  pillar3Title: 'Pelestarian Budaya',
  pillar3Desc: 'Berkomitmen menjaga dan mengembangkan warisan budaya batik Indonesia di kancah nasional untuk generasi muda.',
  pillar4Title: 'Kolaborasi',
  pillar4Desc: 'Bekerja sama dengan sentra-sentra batik guna meningkatkan perekonomian lokal pengrajin batik mikro di pelosok Jawa Timur.',
  
  showcase1Title: 'Batik Tradisional',
  showcase1Subtitle: 'Klasik & Sakral',
  showcase1ImageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
  showcase2Title: 'Batik Modern',
  showcase2Subtitle: 'Gaya Hidup Dinamis',
  showcase2ImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500',
  showcase3Title: 'Aksesoris Batik',
  showcase3Subtitle: 'Syal & Pelengkap',
  showcase3ImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
  
  philoSubtitle: 'INTERPRETASI NILAI-NILAI',
  philoTitle: 'Filosofi Batik Jawa Timur',
  philoDescription: 'Batik bukan sekadar kain bermotif, melainkan cerminan nilai-nilai filosofis yang mendalam. Setiap motif batik Jawa Timur mengandung makna tentang kehidupan, kebijaksanaan, dan harmoni dengan alam. Dari motif Mega Mendung yang melambangkan harapan, hingga Parang yang menggambarkan kekuatan, setiap helai batik menceritakan kisah leluhur kita.',
  philoGroupSubtitle: 'MALAM PUNCAK KEAKRABAN',
  philoGroupTitle: 'Kelompok Finalis Putera Puteri Batik',
  philoGroupImageUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=800&auto=format&fit=crop&q=80',
  
  heroBadge: 'PRESERVASI BUDAYA LUHUR TINGKAT PROVINSI',
  heroTitle: 'Selamat Datang di Ikatan Putera Puteri Batik Jawa Timur',
  
  catalogSubtitle: 'E-KATALOG BATIK JAWA TIMUR',
  catalogTitle: 'Koleksi Terbaru Mahakarya Pengrajin',
  bestsellersSubtitle: 'PRODUK TERLARIS',
  bestsellersTitle: 'Pilihan Favorit Kolektor Batik',
  testiSubtitle: 'TESTIMONI PECINTA BATIK',
  testiTitle: 'Apa Kata Kolektor Dan Pengunjung?',
  recomSubtitle: 'REKOMENDASI TERBAIK',
  recomTitle: 'Rekomendasi Produk Pilihan',
  eventsSubtitle: 'KALENDER KEGIATAN KULTUR',
  eventsTitle: 'Event & Dokumentasi Berharga'
};

export const initialAnalytics: AnalyticsData = {
  totalVisitors: 8439,
  popularPages: [
    { path: '/', title: 'Beranda Profil', views: 5120 },
    { path: '#sejarah', title: 'Sejarah Batik Jatim', views: 2450 },
    { path: '#katalog', title: 'Katalog Batik & Produk', views: 4210 },
    { path: '#filosofi', title: 'Filosofi Batik', views: 3100 },
    { path: '#event', title: 'Event & Dokumentasi', views: 1890 }
  ],
  catalogConversions: [
    { name: 'Batik Mega Mendung', clicks: 840, purchases: 145 },
    { name: 'Batik Parang', clicks: 650, purchases: 110 },
    { name: 'Batik Kawung', clicks: 420, purchases: 78 },
    { name: 'Batik Truntum', clicks: 390, purchases: 65 },
    { name: 'Batik Lasem', clicks: 580, purchases: 95 }
  ],
  eventStats: [
    { eventId: 'ev-1', title: 'FESTIVAL BATIK NASIONAL 2024', limit: 300, registered: 245 },
    { eventId: 'ev-2', title: 'WORKSHOP BATIK TULIS', limit: 50, registered: 45 },
    { eventId: 'ev-3', title: 'PAMERAN BATIK KONTEMPORER', limit: 150, registered: 120 }
  ]
};

export const initialSubscribers: Subscriber[] = [
  { id: 'sub-1', email: 'anindya.widya@gmail.com', subscribeDate: '2026-06-01' },
  { id: 'sub-2', email: 'budi.bagas@yahoo.com', subscribeDate: '2026-06-03' },
  { id: 'sub-3', email: 'citra.kirana@outlook.com', subscribeDate: '2026-06-08' },
  { id: 'sub-4', email: 'dewanto.putra@protonmail.com', subscribeDate: '2026-06-11' }
];

// Aesthetic Sponsor/Partner logos
export const brandPartners = [
  { name: 'LAVENDER AGENCY', logoText: 'LAVENDER AGENCY' },
  { name: 'VIN-TAGE', logoText: 'VIN-TAGE' },
  { name: 'VIOLET', logoText: 'VIOLET' },
  { name: 'CEATHES', logoText: 'CEATHES' },
  { name: 'Creater Fav', logoText: 'Creater Fav' }
];

// Putera Puteri Model Highlight Profiles
export const highlightedModels = [
  {
    name: 'SEJARAH BATIK JAWA TIMUR',
    subtext: 'Jelajahi perjalanan panjang batik sebagai warisan budaya yang tak ternilai dari Jawa Timur.',
    linkText: 'PELAJARI LEBIH LANJUT',
    sectionAnchor: '#sejarah',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    tag: 'PUTERA BATIK JAWA TIMUR 2025'
  },
  {
    name: 'HUBUNGI KAMI',
    subtext: 'Bergabunglah dengan komunitas pecinta batik Jawa Timur untuk melestarikan budaya.',
    linkText: 'HUBUNGI SEKARANG',
    sectionAnchor: '#kontak',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    tag: 'HUBUNGI KAMI'
  },
  {
    name: 'KATALOG BATIK',
    subtext: 'Temukan koleksi batik berkualitas dari berbagai sentra batik di Jawa Timur.',
    linkText: 'LIHAT KATALOG',
    sectionAnchor: '#katalog',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tag: 'KATALOG BATIK'
  }
];

export const instagramPosts = [
  { id: 'ig-1', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { id: 'ig-2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
  { id: 'ig-3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'ig-4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'ig-5', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { id: 'ig-6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' }
];

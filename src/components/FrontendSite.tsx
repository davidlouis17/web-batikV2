/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Heart, 
  ArrowRight, 
  BookOpen, 
  Award, 
  RefreshCw, 
  Star, 
  Mail, 
  Phone, 
  MapPin as MapIcon, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { Product, Event, Testimonial, WebsiteSettings, Subscriber, GalleryPhoto } from '../types';
import { brandPartners, highlightedModels, instagramPosts } from '../data/mockData';
import { saveSubscriberToFirebase, saveEventToFirebase } from '../lib/firebase';

interface FrontendSiteProps {
  products: Product[];
  events: Event[];
  testimonials: Testimonial[];
  settings: WebsiteSettings;
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  galleryPhotos: GalleryPhoto[];
  onNotify: (message: string, type: 'success' | 'error') => void;
  highlightCards?: any[];
  onTrackPageView?: (path: string, title: string) => void;
  onTrackProductClick?: (prodName: string) => void;
  onTrackProductPurchase?: (prodName: string) => void;
}

export default function FrontendSite({
  products,
  events,
  testimonials,
  settings,
  setSubscribers,
  setEvents,
  galleryPhotos,
  onNotify,
  highlightCards = highlightedModels,
  onTrackPageView,
  onTrackProductClick,
  onTrackProductPurchase
}: FrontendSiteProps) {
  // Navigation active state
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Batik Tradisional' | 'Batik Modern' | 'Batik Kontemporer' | 'Aksesoris Batik'>('Semua');
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // Interactive Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRegisteringEvent, setIsRegisteringEvent] = useState<Event | null>(null);
  const [registrantName, setRegistrantName] = useState('');
  const [registrantEmail, setRegistrantEmail] = useState('');
  const [registrantPhone, setRegistrantPhone] = useState('');

  // Track initial page load pageview
  useEffect(() => {
    if (onTrackPageView) {
      onTrackPageView('/', 'Beranda Profil');
    }
  }, []);

  // Track product clicks
  useEffect(() => {
    if (selectedProduct && onTrackProductClick) {
      onTrackProductClick(selectedProduct.name);
    }
  }, [selectedProduct]);

  // Philosophical detailed drawer
  const [philosophyBatik, setPhilosophyBatik] = useState<Product | null>(products[0] || null);

  // Testimonial slider index
  const [testiIndex, setTestiIndex] = useState(0);

  // Filtered Products
  const filteredProducts = selectedCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Handle newsletter sub
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    // Add to subscribers list
    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: newsletterEmail,
      subscribeDate: new Date().toISOString().split('T')[0]
    };
    
    setSubscribers(prev => {
      // Avoid duplicates
      if (prev.some(s => s.email.toLowerCase() === newsletterEmail.toLowerCase())) {
        onNotify('Email Anda sudah terdaftar dalam newsletter!', 'error');
        return prev;
      }
      
      // Save directly to Firebase
      saveSubscriberToFirebase(newSub)
        .then(() => {
          onNotify('Selamat! Anda berhasil bergabung dalam Komunitas Batik Jatim.', 'success');
        })
        .catch(err => {
          console.error(err);
          onNotify('Gagal menghubungi server untuk newsletter.', 'error');
        });

      return [newSub, ...prev];
    });

    setNewsletterEmail('');
  };

  // Handle Event registration form
  const handleEventRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisteringEvent || !registrantName || !registrantEmail) {
      onNotify('Mohon lengkapi data registrasi Anda!', 'error');
      return;
    }

    const updatedEvents = events.map(ev => {
      if (ev.id === isRegisteringEvent.id) {
        const nextEv = {
          ...ev,
          registrantsCount: (ev.registrantsCount || 0) + 1
        };
        // Commit registration increment to Firebase
        saveEventToFirebase(nextEv).catch(err => {
          console.error('Failed to sync event registration to Firebase:', err);
        });
        return nextEv;
      }
      return ev;
    });

    setEvents(updatedEvents);
    onNotify(`Registrasi berhasil untuk "${isRegisteringEvent.title}". Tiket Anda telah dikirim ke ${registrantEmail}!`, 'success');
    
    // Reset forms
    setIsRegisteringEvent(null);
    setRegistrantName('');
    setRegistrantEmail('');
    setRegistrantPhone('');
  };

  // Get active testimonials (status: Aktif)
  const activeTestimonials = testimonials.filter(t => t.status === 'Aktif');

  const nextTesti = () => {
    setTestiIndex((prev) => (prev + 1) % activeTestimonials.length);
  };

  const prevTesti = () => {
    setTestiIndex((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-batik-secondary selection:text-white" id="beranda">
      
      {/* ----------------- SECTION 1: HERO & WELCOME SHOWCASE ----------------- */}
      <section className="bg-batik-light py-20 sm:py-24 relative overflow-hidden border-b border-[#8B0022]/15">
        <div className="absolute inset-0 batik-overlay-pattern pointer-events-none opacity-[0.06]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-batik-secondary/50"></span>
            <span className="text-xs font-bold tracking-[0.3em] text-[#C92C53] uppercase inline-block">
              {settings.heroBadge || 'PRESERVASI BUDAYA LUHUR TINGKAT PROVINSI'}
            </span>
            <span className="w-8 h-[1px] bg-batik-secondary/50"></span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#8B0022] max-w-4xl mx-auto leading-none mb-6">
            {settings.heroTitle || 'Selamat Datang di Ikatan Putera Puteri Batik Jawa Timur'}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto mt-6 leading-relaxed italic">
            "{settings.siteDescription} Temukan keindahan khazanah seni, filosofi, dan sejarah batik dari seluruh penjuru kebudayaan Arekan, Mataraman, Madura, dan Pendalungan Jawa Timur."
          </p>

          <div className="flex justify-center space-x-4 mt-8">
            <a 
              href="#katalog" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#8B0022] text-white hover:bg-[#C92C53] px-8 py-3 text-xs font-bold tracking-widest uppercase transition duration-300 shadow-sm"
            >
              JELAJAHI KOLEKSI
            </a>
            <a 
              href="#sejarah" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('sejarah')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-[#8B0022] text-[#8B0022] hover:bg-[#8B0022]/5 px-8 py-3 text-xs font-bold tracking-widest uppercase transition duration-300"
            >
              ASAL USUL BUDAYA
            </a>
          </div>

          {/* Portrait Cards of Highlighted Putera Puteri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            {highlightCards.map((model, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-lg border border-[#8B0022]/10 shadow-sm hover:border-[#8B0022]/25 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="relative overflow-hidden rounded aspect-[3/4] bg-slate-150 border border-slate-100">
                  <img 
                    src={model.image} 
                    alt={model.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-[#8B0022] text-white text-[9px] font-bold tracking-widest px-3 py-1 uppercase shadow-sm">
                    {model.tag}
                  </div>
                </div>

                <div className="mt-5 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-[1px] bg-[#C92C53]/60"></span>
                    <span className="text-[9px] font-bold tracking-widest text-[#C92C53] uppercase">{model.tag || 'Duta Batik'}</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#8B0022] text-base tracking-wide uppercase">{model.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{model.subtext}</p>
                  
                  <a 
                    href={model.sectionAnchor}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.querySelector(model.sectionAnchor);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-[10px] font-bold tracking-widest text-[#C92C53] hover:text-[#8B0022] flex items-center gap-1.5 mt-4 duration-200 uppercase"
                  >
                    {model.linkText}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 2: FEATURES (SEJARAH BATIK) ----------------- */}
      <section className="bg-[#1A1A1A] py-20 text-white text-center relative border-b border-[#8B0022]/20" id="sejarah">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#F25C79] uppercase block mb-2">
            {settings.aboutSubtitle || 'PILAR UTAMA ASOSIASI'}
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">
            {settings.aboutTitle || 'Sejarah & Perjuangan Batik Jawa Timur'}
          </h3>
          <div className="w-16 h-[1.5px] bg-[#C92C53] mx-auto mt-4 mb-3"></div>

          {/* 4 Feature Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-12 max-w-6xl mx-auto divide-y divide-[#8B0022]/20 sm:divide-y-0 sm:divide-x divide-[#8B0022]/20 border border-[#8B0022]/20 bg-black/20">
            
            <div className="p-8 space-y-4 hover:bg-white/[0.02] transition duration-300">
              <div className="w-12 h-12 flex items-center justify-center mx-auto text-[#F25C79] bg-[#8B0022]/25 rounded-full">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-widest uppercase text-rose-100">
                {settings.pillar1Title || 'Workshop Batik'}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {settings.pillar1Desc || 'Ikuti workshop pembuatan batik tradisional dan modern bersama pengrajin berpengalaman di berbagai sentra daerah.'}
              </p>
            </div>

            <div className="p-8 space-y-4 hover:bg-white/[0.02] transition duration-300">
              <div className="w-12 h-12 flex items-center justify-center mx-auto text-[#F25C79] bg-[#8B0022]/25 rounded-full">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-widest uppercase text-rose-100">
                {settings.pillar2Title || 'Katalog Produk'}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {settings.pillar2Desc || 'Jelajahi koleksi batik berkualitas dari berbagai sentra batik di Jawa Timur yang didesain secara unik dan penuh estetika.'}
              </p>
            </div>

            <div className="p-8 space-y-4 hover:bg-white/[0.02] transition duration-300">
              <div className="w-12 h-12 flex items-center justify-center mx-auto text-[#F25C79] bg-[#8B0022]/25 rounded-full">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-widest uppercase text-rose-100">
                {settings.pillar3Title || 'Pelestarian Budaya'}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {settings.pillar3Desc || 'Berkomitmen menjaga dan mengembangkan warisan budaya batik Indonesia di kalangan pemuda-pemudi di kancah nasional.'}
              </p>
            </div>

            <div className="p-8 space-y-4 hover:bg-white/[0.02] transition duration-300">
              <div className="w-12 h-12 flex items-center justify-center mx-auto text-[#F25C79] bg-[#8B0022]/25 rounded-full">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm tracking-widest uppercase text-rose-100">
                {settings.pillar4Title || 'Kolaborasi'}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {settings.pillar4Desc || 'Bekerja sama dengan sentra-sentra batik guna meningkatkan perekonomian lokal pengrajin batik mikro di pelosok Jawa Timur.'}
              </p>
            </div>

          </div>

          {/* Square Categories Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="relative rounded overflow-hidden aspect-[4/3] group shadow border border-[#8B0022]/10">
              <img 
                src={settings.showcase1ImageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'} 
                alt="Batik Tradisional" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-left">
                <h5 className="font-serif text-sm font-bold tracking-widest text-white uppercase">
                  {settings.showcase1Title || 'Batik Tradisional'}
                </h5>
                <span className="text-[10px] text-[#F25C79] font-bold uppercase mt-1 tracking-wider">
                  {settings.showcase1Subtitle || 'Klasik & Sakral'}
                </span>
              </div>
            </div>

            <div className="relative rounded overflow-hidden aspect-[4/3] group shadow border border-[#8B0022]/10">
              <img 
                src={settings.showcase2ImageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500'} 
                alt="Batik Modern" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-left">
                <h5 className="font-serif text-sm font-bold tracking-widest text-white uppercase">
                  {settings.showcase2Title || 'Batik Modern'}
                </h5>
                <span className="text-[10px] text-[#F25C79] font-bold uppercase mt-1 tracking-wider">
                  {settings.showcase2Subtitle || 'Gaya Hidup Dinamis'}
                </span>
              </div>
            </div>

            <div className="relative rounded overflow-hidden aspect-[4/3] group shadow border border-[#8B0022]/10">
              <img 
                src={settings.showcase3ImageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'} 
                alt="Aksesoris Batik" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-left">
                <h5 className="font-serif text-sm font-bold tracking-widest text-white uppercase">
                  {settings.showcase3Title || 'Aksesoris Batik'}
                </h5>
                <span className="text-[10px] text-[#F25C79] font-bold uppercase mt-1 tracking-wider">
                  {settings.showcase3Subtitle || 'Syal & Pelengkap'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 3: PRODUCTS & HIGHLIGHTS (KATALOG) ----------------- */}
      <section className="bg-white py-16 text-slate-800 border-b border-[#8B0022]/15" id="katalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#8B0022]/15">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#C92C53] uppercase block mb-1">
                {settings.catalogSubtitle || 'E-KATALOG BATIK JAWA TIMUR'}
              </span>
              <h3 className="font-serif text-3xl font-bold tracking-tight text-[#8B0022]">
                {settings.catalogTitle || 'Koleksi Terbaru Mahakarya Pengrajin'}
              </h3>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 font-sans text-xs">
              {(['Semua', 'Batik Tradisional', 'Batik Modern', 'Batik Kontemporer', 'Aksesoris Batik'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded transition font-semibold text-xs ${
                    selectedCategory === cat 
                      ? 'bg-[#8B0022] text-white font-bold shadow-sm' 
                      : 'bg-[#8B0022]/5 text-[#8B0022] hover:bg-[#8B0022]/10 border border-[#8B0022]/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of fabric products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="bg-[#FDE9ED]/20 border border-[#8B0022]/10 hover:border-[#8B0022]/25 rounded-md p-4 transition-all duration-300 group hover:bg-white cursor-pointer text-left flex flex-col justify-between h-full"
              >
                <div>
                  <div className="relative rounded overflow-hidden aspect-square bg-[#8B0022]/5 mb-4 border border-[#8B0022]/5">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-sm ${
                        prod.status === 'Tersedia' ? 'bg-[#8B0022] text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {prod.status}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold text-[#C92C53] tracking-widest uppercase block">{prod.category}</span>
                  <h4 className="font-serif font-bold text-base text-[#8B0022] mt-1.5 line-clamp-1">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#8B0022]/10">
                  <span className="text-xs font-bold text-[#8B0022] font-mono">Rp {prod.price.toLocaleString('id-ID')}</span>
                  <button 
                    className="text-[10px] font-bold tracking-widest text-[#8B0022] hover:text-[#C92C53] uppercase flex items-center gap-1 transition"
                  >
                    SELENGKAPNYA
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 4: FILOSOFI BATIK JAWA TIMUR ----------------- */}
      <section className="bg-white py-20 border-b border-[#8B0022]/15" id="filosofi">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Elegant collective group photo */}
            <div className="relative rounded overflow-hidden max-h-[420px] border border-[#8B0022]/20 shadow-sm">
              <img 
                src={settings.philoGroupImageUrl || "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=800&auto=format&fit=crop&q=80"} 
                alt="Putera Puteri Batik Jatim Group" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#F25C79] uppercase">
                  {settings.philoGroupSubtitle || 'Malam Puncak Keakraban'}
                </span>
                <h5 className="font-serif text-lg font-bold tracking-wide mt-1">
                  {settings.philoGroupTitle || 'Kelompok Finalis Putera Puteri Batik'}
                </h5>
              </div>
            </div>

            {/* Filosofi descriptions */}
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1.5px] bg-[#C92C53]"></span>
                <span className="text-xs font-bold tracking-widest text-[#C92C53] uppercase block">
                  {settings.philoSubtitle || 'INTERPRETASI NILAI-NILAI'}
                </span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#8B0022] leading-tight">
                {settings.philoTitle || 'Filosofi Batik Jawa Timur'}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                {settings.philoDescription || 'Batik bukan sekadar kain bermotif, melainkan cerminan nilai-nilai filosofis yang mendalam. Setiap motif batik Jawa Timur mengandung makna tentang kehidupan, kebijaksanaan, dan harmoni dengan alam. Dari motif Mega Mendung yang melambangkan harapan, hingga Parang yang menggambarkan kekuatan, setiap helai batik menceritakan kisah leluhur kita.'}
              </p>

              {/* Miniature selector for specific motif meaning */}
              <div className="p-5 bg-[#FDE9ED]/40 border border-[#8B0022]/10 rounded-md space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h5 className="font-serif font-bold text-xs text-[#8B0022] flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-[#C92C53]" />
                    MAKNA MOTIF: {philosophyBatik?.name || 'Batik Mega Mendung'}
                  </h5>
                  <select 
                    className="bg-white border border-[#8B0022]/15 text-[#8B0022] font-semibold rounded text-[10px] p-1.5 focus:outline-none"
                    value={philosophyBatik?.id}
                    onChange={(e) => {
                      const found = products.find(p => p.id === e.target.value);
                      if (found) setPhilosophyBatik(found);
                    }}
                  >
                    {products.filter(p => p.philosophy).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed border-l-2 border-[#C92C53] pl-3 py-0.5">
                  "{philosophyBatik?.philosophy || 'Pakaian resmi kebesaran raja dan kerabat dekat yang melambangkan kebesaran budi pekerti serta keseimbangan hidup.'}"
                </p>
              </div>

              <div className="pt-2">
                <a 
                  href="#katalog"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#8B0022] text-white text-xs font-bold px-6 py-3 rounded hover:bg-[#C92C53] transition inline-block shadow-sm tracking-wider uppercase"
                >
                  PELAJARI FILOSOFI BATIK
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- SECTION 5: PRODUK TERLARIS (DARK ACCENT) ----------------- */}
      <section className="bg-[#1A1A1A] py-20 text-white text-center border-b border-[#8B0022]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#F25C79] uppercase block mb-2">
            {settings.bestsellersSubtitle || 'PRODUK TERLARIS'}
          </span>
          <h3 className="font-serif text-3xl font-bold tracking-wide text-white">
            {settings.bestsellersTitle || 'Pilihan Favorit Kolektor Batik'}
          </h3>
          <div className="w-16 h-[1.5px] bg-[#C92C53] mx-auto mt-4 mb-12"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {products.slice(0, 4).map((prod) => (
              <div 
                key={`terlaris-${prod.id}`}
                onClick={() => setSelectedProduct(prod)}
                className="bg-white/[0.03] hover:bg-white/[0.08] p-4 rounded cursor-pointer text-left transition border border-white/10 hover:border-[#C92C53]/50"
              >
                <div className="rounded overflow-hidden aspect-square bg-white/5 mb-4 border border-white/5">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                  />
                </div>
                <h4 className="font-serif font-bold text-sm text-white line-clamp-1">{prod.name}</h4>
                <p className="text-xs text-[#F25C79] font-mono mt-1.5 font-bold">Rp {prod.price.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 6: WIDE PHOTO OF STAGE ----------------- */}
      <section 
        className="relative h-96 sm:h-[450px] bg-cover bg-center overflow-hidden border-b border-[#8B0022]/15" 
        style={{ backgroundImage: `url('${settings.stageBannerImageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400"}')` }}
      >
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-6 text-center">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#F25C79] uppercase">
              {settings.stageBannerSubtitle || 'GRAND FINAL SELECTION'}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight">
              {settings.stageBannerTitle || 'Mewadahi Talenta Muda Kreatif Untuk Budaya Berharga'}
            </h3>
            <p className="text-rose-100/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {settings.stageBannerDescription || 'Momen bersejarah penganugerahan Putera Puteri Batik Jatim, menjembatani kolaborasi pengrajin daerah dan pasar modern internasional.'}
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 7: TESTIMONIAL PECINTA BATIK ----------------- */}
      <section className="bg-batik-light py-20 text-center border-b border-[#8B0022]/15">
        <div className="max-w-4xl mx-auto px-4 relative">
          
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#C92C53] uppercase block mb-2">
            {settings.testiSubtitle || 'TESTIMONI PECINTA BATIK'}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B0022] tracking-tight">
            {settings.testiTitle || 'Apa Kata Kolektor Dan Pengunjung?'}
          </h3>
          <div className="w-12 h-[1.5px] bg-[#C92C53] mx-auto mt-4 mb-10"></div>

          {/* Active Testimonial Frame wrapper */}
          {activeTestimonials.length > 0 && (
            <div className="space-y-4 min-h-[140px] flex flex-col justify-center">
              <p className="font-serif text-lg sm:text-xl text-[#8B0022] italic font-medium leading-relaxed max-w-3xl mx-auto">
                "{activeTestimonials[testiIndex].content}"
              </p>
              <div className="pt-2">
                <h5 className="font-sans font-bold text-xs text-[#8B0022] uppercase tracking-widest">{activeTestimonials[testiIndex].name}</h5>
                <span className="text-[10px] text-slate-500 mt-1 block font-semibold">{activeTestimonials[testiIndex].role}</span>
              </div>
            </div>
          )}

          {/* Indicator slide dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={prevTesti} className="p-1.5 text-[#8B0022]/40 hover:text-[#8B0022] duration-100 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {activeTestimonials.map((_, i) => (
              <button 
                key={i}
                onClick={() => setTestiIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === testiIndex ? 'bg-[#8B0022] w-5' : 'bg-[#8B0022]/15'
                }`}
              />
            ))}
            <button onClick={nextTesti} className="p-1.5 text-[#8B0022]/40 hover:text-[#8B0022] duration-100 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 8: RECOMMENDED & EVENTS & DOKUMENTASI ----------------- */}
      <section className="bg-white py-20 text-slate-800 border-b border-[#8B0022]/15" id="event">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Subsection: Rekomendasi Produk */}
          <div className="mb-16">
            <div className="flex justify-between items-end pb-3 border-b border-[#8B0022]/15 mb-8">
              <div>
                <span className="text-[10px] font-bold text-[#C92C53] tracking-[0.25em] block uppercase text-left">
                  {settings.recomSubtitle || 'REKOMENDASI TERBAIK'}
                </span>
                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-left text-[#8B0022] mt-1">
                  {settings.recomTitle || 'Rekomendasi Produk Pilihan'}
                </h4>
              </div>
              <a 
                href="#katalog" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] text-[#8B0022] hover:text-[#C92C53] underline font-serif font-bold uppercase tracking-wider"
              >
                LIHAT SEMUA
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(4, 8).map((prod) => (
                <div 
                  key={`recom-${prod.id}`}
                  onClick={() => setSelectedProduct(prod)}
                  className="bg-[#FDE9ED]/10 hover:bg-[#FDE9ED]/30 border border-[#8B0022]/10 p-4 rounded-md cursor-pointer text-left transition"
                >
                  <div className="rounded overflow-hidden aspect-square bg-[#8B0022]/5 mb-3 border border-[#8B0022]/5">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102"
                    />
                  </div>
                  <h5 className="font-serif text-base font-bold text-[#8B0022] line-clamp-1">{prod.name}</h5>
                  <p className="text-xs text-[#C92C53] mt-1 font-mono font-bold">Rp {prod.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subsection: Event & Dokumentasi */}
          <div>
            <div className="flex justify-between items-end pb-3 border-b border-[#8B0022]/15 mb-8">
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#C92C53] tracking-[0.25em] block uppercase">
                  {settings.eventsSubtitle || 'KALENDER KEGIATAN KULTUR'}
                </span>
                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#8B0022] mt-1">
                  {settings.eventsTitle || 'Event & Dokumentasi Berharga'}
                </h4>
              </div>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((ev) => (
                <div 
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="bg-white border border-[#8B0022]/10 rounded-md overflow-hidden shadow-sm transition duration-300 flex flex-col justify-between cursor-pointer group text-left hover:border-[#8B0022]/25 hover:shadow-md"
                >
                  <div>
                    <div className="h-44 object-cover relative overflow-hidden bg-[#8B0022]/5">
                      <img 
                        src={ev.image} 
                        alt={ev.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#8B0022] text-white text-[9px] font-bold tracking-widest px-3 py-1 uppercase rounded-sm shadow-xs">
                        {ev.type}
                      </div>
                    </div>
 
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#C92C53] text-[11px] font-semibold font-sans">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-serif">{ev.date}</span>
                        <span className="text-slate-300">|</span>
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{ev.location}</span>
                      </div>
                      
                      <h5 className="font-serif text-base font-bold text-[#8B0022] tracking-wide uppercase line-clamp-1 group-hover:text-[#C92C53] transition">
                        {ev.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>
 
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                      ev.status === 'Mendatang' ? 'bg-[#8B0022] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {ev.status === 'Mendatang' ? 'Pendaftaran Dibuka' : 'Selesai'}
                    </span>
                    
                    {ev.status === 'Mendatang' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRegisteringEvent(ev);
                        }}
                        className="bg-[#8B0022] text-white hover:bg-[#C92C53] text-[10px] font-bold px-3 py-1.5 rounded uppercase transition shadow-sm"
                      >
                        DAFTAR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- SECTION 9: SPONSORS BAR ----------------- */}
      <section className="bg-[#FAF0F2] py-10 border-y border-[#8B0022]/15 overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-85">
            {brandPartners.map((bp, i) => (
              <span 
                key={i}
                className="font-serif font-bold text-[13px] tracking-[0.25em] text-[#8B0022] uppercase"
              >
                {bp.logoText}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 10: COMMUNITAS NEWSLETTER ----------------- */}
      <section className="bg-[#FAF0F2]/50 py-20 text-slate-800 text-center relative border-t border-[#8B0022]/10" id="newsletter">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#C92C53] uppercase block">PRESERVASI & DUKUNGAN</span>
          <h3 className="font-serif text-3xl font-bold tracking-tight text-[#8B0022] uppercase">BERGABUNG DENGAN KOMUNITAS BATIK</h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Dapatkan katalog eksklusif mingguan mengenai pameran batik terbaru, pembiayaan pengrajin daerah, serta rilis koleksi batik tulis premium Jawa Timur.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch justify-center max-w-md mx-auto gap-2.5 pt-2">
            <input 
              type="email" 
              required
              className="px-4 py-3 bg-white text-slate-800 border border-[#8B0022]/20 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8B0022] font-semibold flex-1 shadow-xs"
              placeholder="Alamat Email Anda"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-[#8B0022] hover:bg-[#C92C53] text-white font-bold tracking-widest text-xs px-8 py-3 rounded uppercase transition duration-200 font-serif"
            >
              BERGABUNG
            </button>
          </form>

        </div>
      </section>

      {/* ----------------- SECTION 11: GALLERY HORIZONTAL CAROUSEL ----------------- */}
      <section className="border-t border-[#8B0022]/10 bg-white relative group/carousel overflow-hidden">
        {/* Navigation Arrows for screens with pointers */}
        <button 
          onClick={() => {
            const container = document.getElementById('gallery-carousel-track');
            if (container) {
              container.scrollBy({ left: -320, behavior: 'smooth' });
            }
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#8B0022] hover:bg-[#C92C53] text-white p-2 sm:p-2.5 rounded shadow-lg transition duration-200 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center cursor-pointer select-none active:scale-95"
          aria-label="Scroll Kiri"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button 
          onClick={() => {
            const container = document.getElementById('gallery-carousel-track');
            if (container) {
              container.scrollBy({ left: 320, behavior: 'smooth' });
            }
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#8B0022] hover:bg-[#C92C53] text-white p-2 sm:p-2.5 rounded shadow-lg transition duration-200 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center cursor-pointer select-none active:scale-95"
          aria-label="Scroll Kanan"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Track - supports fluid layout */}
        <div 
          id="gallery-carousel-track"
          className="overflow-x-auto flex scroll-smooth snap-x snap-mandatory border-b border-[#8B0022]/10 no-scrollbar select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {galleryPhotos.map((post, index) => (
            <div 
              key={post.id || index} 
              className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[22%] lg:w-[16.666%] aspect-square relative overflow-hidden group bg-rose-50/50 border-r border-[#8B0022]/10 snap-start"
            >
              <img 
                src={post.url} 
                alt={`Museum & Model Jatim Galeri ${index + 1}`} 
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                <a 
                  href="https://www.instagram.com/puteraputeribatikjatim/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#8B0022] text-white text-[9px] font-bold tracking-widest px-3 py-2 rounded uppercase hover:bg-[#C92C53] transition shadow-md whitespace-nowrap"
                >
                  IKUTI KAMI DI IG
                </a>
              </div>
            </div>
          ))}
          {galleryPhotos.length === 0 && (
            <div className="w-full py-20 text-center text-slate-400 bg-slate-50 font-sans text-xs">
              Belum ada foto galeri panggung. Akses Dashboard Admin untuk mengunggah foto baru.
            </div>
          )}
        </div>
      </section>

      {/* ----------------- SECTION 12: DYNAMIC CONCISE CONTACT & INFO ----------------- */}
      <section className="bg-[#FAF0F2] py-20 text-slate-800" id="kontak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-4 text-left">
              <h4 className="font-serif font-bold text-lg text-batik-primary">Ikatan Putera Puteri Batik Jawa Timur</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mt-2">
                Menjaga dan mempromosikan warisan batik Jawa Timur melalui kolaborasi dengan sentra-sentra batik daerah. Mari lestarikan kebudayaan luhur bangsa untuk masa depan gemilang.
              </p>
              <div className="flex gap-3 text-xs pt-2">
                <span className="font-bold underline text-batik-secondary cursor-pointer">Instagram</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold underline text-batik-secondary cursor-pointer">Facebook</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold underline text-batik-secondary cursor-pointer">YouTube</span>
              </div>
            </div>

            <div className="lg:pl-8 text-left">
              <h4 className="font-serif font-bold text-sm tracking-widest text-[#C92C53] uppercase pb-2 border-b border-rose-200">INFORMASI & LAYANAN</h4>
              <ul className="text-xs mt-4 space-y-2.5 font-sans font-semibold text-slate-600">
                <li><a href="#event" className="hover:text-batik-primary transition">Event Mendatang</a></li>
                <li><a href="#katalog" className="hover:text-batik-primary transition">Katalog Produk</a></li>
                <li><a href="#kontak" className="hover:text-batik-primary transition">Hubungi Kami</a></li>
                <li><a href="#sejarah" className="hover:text-batik-primary transition">Lokasi Sentra Produksi</a></li>
                <li><a href="#beranda" className="hover:text-batik-primary transition">FAQ Pelanggan</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="font-serif font-bold text-sm tracking-widest text-[#C92C53] uppercase pb-2 border-b border-rose-200">HUBUNGI KAMI KAMI</h4>
              <ul className="text-xs mt-4 space-y-3 font-sans font-medium text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-batik-secondary" />
                  <span className="font-sans font-semibold">{settings.contactInfo.email}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-batik-secondary" />
                  <span className="font-semibold">{settings.contactInfo.phone}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapIcon className="w-4 h-4 text-batik-secondary mt-0.5" />
                  <span className="line-clamp-2 leading-normal">{settings.contactInfo.address}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- POPUP MODAL: PRODUCT DETAILS ----------------- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="product-detail-modal">
          <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full border border-rose-100 shadow-2xl relative text-slate-800 flex flex-col md:flex-row text-left">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-full md:w-1/2 aspect-square bg-[#FAF0F2]">
              <img 
                src={selectedProduct.images[0]} 
                alt={selectedProduct.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 md:w-1/2 flex flex-col justify-between font-sans text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-batik-secondary tracking-widest uppercase block">{selectedProduct.category}</span>
                  <h4 className="font-serif text-lg font-bold text-slate-800 uppercase mt-0.5">{selectedProduct.name}</h4>
                  <p className="text-sm font-bold text-rose-700 font-mono mt-1">Rp {selectedProduct.price.toLocaleString('id-ID')}</p>
                </div>
                
                <p className="text-slate-600 leading-relaxed text-[11px]">{selectedProduct.description}</p>
                
                {selectedProduct.philosophy && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100/50">
                    <span className="font-serif font-bold text-[10px] text-batik-primary block">Filosofi Batik:</span>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed mt-1">"{selectedProduct.philosophy}"</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex flex-col gap-2 mt-4">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Kode Stok:</span>
                  <span className="font-bold font-mono text-slate-600">{selectedProduct.id}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Status Stok:</span>
                  <span className="font-bold text-emerald-600">{selectedProduct.status}</span>
                </div>
                <button
                  onClick={() => {
                    if (onTrackProductPurchase) {
                      onTrackProductPurchase(selectedProduct.name);
                    }
                    setSelectedProduct(null);
                    onNotify(`Pembelian motif "${selectedProduct.name}" berhasil disimulasikan! Tim pengrajin akan menghubungi kontak Anda.`, 'success');
                  }}
                  className="w-full bg-batik-primary hover:bg-opacity-95 text-white font-bold tracking-widest text-xs py-2.5 rounded mt-2 uppercase transition shadow"
                >
                  SIMULASI PEMBELIAN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- POPUP MODAL: EVENT DETAILS ----------------- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="event-detail-modal">
          <div className="bg-white rounded-2xl overflow-hidden max-w-xl w-full border border-indigo-100 shadow-2xl relative text-slate-800 text-left font-sans text-xs">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-48 relative bg-slate-100">
              <img 
                src={selectedEvent.image} 
                alt={selectedEvent.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <span className="absolute bottom-3 left-4 bg-batik-primary text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase shadow">
                {selectedEvent.type}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-slate-800 uppercase tracking-wide leading-snug">{selectedEvent.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] mt-1.5 font-bold">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-batik-secondary" /> {selectedEvent.date}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-batik-secondary" /> {selectedEvent.location}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{selectedEvent.description}</p>

              <div className="p-3 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Total Delegasi Register:</span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">{selectedEvent.registrantsCount || 0} pendaftar aktif</span>
                </div>
                {selectedEvent.status === 'Mendatang' && (
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setIsRegisteringEvent(selectedEvent);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg shadow uppercase"
                  >
                    Ikut Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- POPUP MODAL: REGISTER FOR FUTURE EVENT ----------------- */}
      {isRegisteringEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="event-registration-modal">
          <form onSubmit={handleEventRegister} className="bg-white rounded-2xl p-6 max-w-md w-full border border-rose-100 shadow-2xl relative text-slate-800 text-left font-sans text-xs space-y-4">
            <button 
              type="button"
              onClick={() => setIsRegisteringEvent(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[9px] text-[#C92C53] font-bold tracking-widest uppercase block">REGISTRASI PESERTA</span>
              <h4 className="font-serif text-sm font-bold text-slate-800 uppercase mt-0.5 line-clamp-1">{isRegisteringEvent.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">Lokasi: {isRegisteringEvent.location}</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Nama Lengkap Pemohon *</label>
                <input 
                  type="text" required
                  className="w-full p-2.5 border rounded text-xs focus:ring-1 focus:ring-batik-primary focus:outline-none"
                  placeholder="Contoh: Rian Dewanto"
                  value={registrantName}
                  onChange={e => setRegistrantName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Situs Email Pribadi *</label>
                <input 
                  type="email" required
                  className="w-full p-2.5 border rounded text-xs focus:ring-1 focus:ring-batik-primary focus:outline-none"
                  placeholder="Contoh: rian.dewanto@gmail.com"
                  value={registrantEmail}
                  onChange={e => setRegistrantEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">No. WhatsApp / HP *</label>
                <input 
                  type="text" required
                  className="w-full p-2.5 border rounded text-xs focus:ring-1 focus:ring-batik-primary focus:outline-none"
                  placeholder="Contoh: 0812345678"
                  value={registrantPhone}
                  onChange={e => setRegistrantPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button 
                type="button" 
                onClick={() => setIsRegisteringEvent(null)}
                className="px-4 py-2 border rounded font-semibold text-slate-500"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-batik-primary hover:bg-opacity-95 text-white font-bold rounded shadow uppercase tracking-wide"
              >
                KIRIM FORM PENDAFTARAN
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

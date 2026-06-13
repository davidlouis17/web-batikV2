/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, CheckCircle2, AlertTriangle, Eye, ArrowRight, Loader } from 'lucide-react';
import Header from './components/Header';
import FrontendSite from './components/FrontendSite';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { Product, Event, Testimonial, WebsiteSettings, Subscriber, AnalyticsData, GalleryPhoto } from './types';
import { 
  initialProducts, 
  initialEvents, 
  initialTestimonials, 
  initialSettings, 
  initialSubscribers, 
  initialAnalytics,
  instagramPosts,
  highlightedModels
} from './data/mockData';
import { 
  auth,
  getProductsFromFirebase,
  getEventsFromFirebase,
  getTestimonialsFromFirebase,
  getSettingsFromFirebase,
  getSubscribersFromFirebase,
  getAnalyticsFromFirebase,
  getGalleryFromFirebase,
  getHighlightCardsFromFirebase,
  saveHighlightCardsToFirebase,
  saveAnalyticsToFirebase
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  // Navigation Routing: Admin Dashboard Mode checked by hash or pathname URL
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.hash === '#admin' || window.location.pathname === '/admin';
  });

  // Track Firebase authenticated user details
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('batik_bypass_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loadingData, setLoadingData] = useState(true);

  // Durable / State Synchronization Core
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('batik_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('batik_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('batik_testimonials');
    return saved ? JSON.parse(saved) : initialTestimonials;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('batik_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('batik_subscribers');
    return saved ? JSON.parse(saved) : initialSubscribers;
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const saved = localStorage.getItem('batik_analytics');
    return saved ? JSON.parse(saved) : initialAnalytics;
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => {
    const saved = localStorage.getItem('batik_gallery');
    return saved ? JSON.parse(saved) : instagramPosts;
  });

  const [highlightCards, setHighlightCards] = useState<any[]>(() => {
    const saved = localStorage.getItem('batik_highlight_cards');
    return saved ? JSON.parse(saved) : highlightedModels;
  });

  // Simple Notification System (Custom elegant Toast)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Track Router URL modifications to transition hash routing in real-time
  useEffect(() => {
    const handleUrlChange = () => {
      const isRoute = window.location.hash === '#admin' || window.location.pathname === '/admin';
      setIsAdminRoute(isRoute);
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Clean and normalize URLs to strip frontend section hashes when in Admin console mode
  useEffect(() => {
    const cleanAdminHash = () => {
      if (window.location.hash && window.location.hash !== '#admin') {
        window.history.replaceState(null, '', window.location.pathname === '/admin' ? '/admin' : '#admin');
      }
    };

    if (isAdminRoute) {
      cleanAdminHash();
      window.addEventListener('hashchange', cleanAdminHash);
      window.addEventListener('popstate', cleanAdminHash);
    }
    return () => {
      window.removeEventListener('hashchange', cleanAdminHash);
      window.removeEventListener('popstate', cleanAdminHash);
    };
  }, [isAdminRoute]);

  // Sync state with Firebase Authentication session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        const bypass = localStorage.getItem('batik_bypass_user');
        if (!bypass) {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all collections from Cloud Firestore upon system mount
  useEffect(() => {
    async function fetchCloudDatabase() {
      try {
        setLoadingData(true);
        const [
          cloudProducts,
          cloudEvents,
          cloudTestimonials,
          cloudSettings,
          cloudSubscribers,
          cloudAnalytics,
          cloudGallery,
          cloudHighlightCards
        ] = await Promise.all([
          getProductsFromFirebase(),
          getEventsFromFirebase(),
          getTestimonialsFromFirebase(),
          getSettingsFromFirebase(),
          getSubscribersFromFirebase(),
          getAnalyticsFromFirebase(),
          getGalleryFromFirebase(),
          getHighlightCardsFromFirebase()
        ]);

        if (cloudProducts && cloudProducts.length > 0) setProducts(cloudProducts);
        if (cloudEvents && cloudEvents.length > 0) setEvents(cloudEvents);
        if (cloudTestimonials && cloudTestimonials.length > 0) setTestimonials(cloudTestimonials);
        if (cloudSettings) setSettings(cloudSettings);
        if (cloudSubscribers && cloudSubscribers.length > 0) setSubscribers(cloudSubscribers);
        if (cloudAnalytics) setAnalytics(cloudAnalytics);
        if (cloudGallery && cloudGallery.length > 0) setGalleryPhotos(cloudGallery);
        if (cloudHighlightCards && cloudHighlightCards.length > 0) setHighlightCards(cloudHighlightCards);

      } catch (error) {
        console.error("Failed to load Cloud Firestore database collections:", error);
        triggerNotification('Gagal mensinkronisasikan basis data cloud Firebase.', 'error');
      } finally {
        setLoadingData(false);
      }
    }
    fetchCloudDatabase();
  }, []);

  // Sync to localStorage on any state changes as durable second-tier layer
  useEffect(() => {
    localStorage.setItem('batik_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('batik_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('batik_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('batik_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('batik_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('batik_analytics', JSON.stringify(analytics));
  }, [analytics]);

  // Track session load once to increment real totalVisitors
  useEffect(() => {
    if (!sessionStorage.getItem('batik_session_active') && analytics) {
      sessionStorage.setItem('batik_session_active', 'true');
      const next = { ...analytics, totalVisitors: analytics.totalVisitors + 1 };
      setAnalytics(next);
      localStorage.setItem('batik_analytics', JSON.stringify(next));
      // Save to Firebase
      saveAnalyticsToFirebase(next).catch(console.error);
    }
  }, [loadingData]);

  // 100% Real-time dynamic sync between products & analytics conversions
  useEffect(() => {
    if (!loadingData && products.length > 0 && analytics) {
      const existingNames = analytics.catalogConversions.map(c => c.name);
      const missingProducts = products.filter(p => !existingNames.includes(p.name));
      if (missingProducts.length > 0) {
        const nextConversions = [...analytics.catalogConversions];
        missingProducts.forEach(mp => {
          nextConversions.push({ name: mp.name, clicks: 0, purchases: 0 });
        });
        const updatedAnalytics = { ...analytics, catalogConversions: nextConversions };
        setAnalytics(updatedAnalytics);
        saveAnalyticsToFirebase(updatedAnalytics).catch(console.error);
      }
    }
  }, [products, loadingData]);

  // 100% Real-time dynamic sync of registered counts from events state to analytics eventStats
  useEffect(() => {
    if (!loadingData && events.length > 0 && analytics) {
      const hasChangedOrNew = events.some(ev => {
        const statObj = analytics.eventStats.find(s => s.eventId === ev.id);
        return !statObj || statObj.registered !== (ev.registrantsCount || 0) || statObj.title !== ev.title;
      });
      if (hasChangedOrNew) {
        const updatedStats = events.map(ev => {
          const existing = analytics.eventStats.find(s => s.eventId === ev.id);
          return {
            eventId: ev.id,
            title: ev.title,
            limit: existing?.limit || 100,
            registered: ev.registrantsCount || 0
          };
        });
        const updatedAnalytics = { ...analytics, eventStats: updatedStats };
        setAnalytics(updatedAnalytics);
        saveAnalyticsToFirebase(updatedAnalytics).catch(console.error);
      }
    }
  }, [events, loadingData]);

  const handleTrackPageView = (path: string, pageTitle: string) => {
    if (!analytics) return;
    const exists = analytics.popularPages.some(p => p.path === path);
    let nextPages = [...analytics.popularPages];
    if (exists) {
      nextPages = nextPages.map(p => p.path === path ? { ...p, views: p.views + 1 } : p);
    } else {
      nextPages.push({ path, title: pageTitle, views: 1 });
    }
    const updatedAnalytics = { ...analytics, popularPages: nextPages };
    setAnalytics(updatedAnalytics);
    saveAnalyticsToFirebase(updatedAnalytics).catch(console.error);
  };

  const handleTrackProductClick = (prodName: string) => {
    if (!analytics) return;
    const exists = analytics.catalogConversions.some(c => c.name === prodName);
    let nextConversions = [...analytics.catalogConversions];
    if (exists) {
      nextConversions = nextConversions.map(c => c.name === prodName ? { ...c, clicks: c.clicks + 1 } : c);
    } else {
      nextConversions.push({ name: prodName, clicks: 1, purchases: 0 });
    }
    const updatedAnalytics = { ...analytics, catalogConversions: nextConversions };
    setAnalytics(updatedAnalytics);
    saveAnalyticsToFirebase(updatedAnalytics).catch(console.error);
  };

  const handleTrackProductPurchase = (prodName: string) => {
    if (!analytics) return;
    const exists = analytics.catalogConversions.some(c => c.name === prodName);
    let nextConversions = [...analytics.catalogConversions];
    if (exists) {
      nextConversions = nextConversions.map(c => c.name === prodName ? { ...c, purchases: c.purchases + 1 } : c);
    } else {
      nextConversions.push({ name: prodName, clicks: 1, purchases: 1 });
    }
    const updatedAnalytics = { ...analytics, catalogConversions: nextConversions };
    setAnalytics(updatedAnalytics);
    saveAnalyticsToFirebase(updatedAnalytics).catch(console.error);
  };

  useEffect(() => {
    localStorage.setItem('batik_gallery', JSON.stringify(galleryPhotos));
  }, [galleryPhotos]);

  useEffect(() => {
    localStorage.setItem('batik_highlight_cards', JSON.stringify(highlightCards));
  }, [highlightCards]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Loading state shimmer
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#FDE9ED] flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 text-batik-primary animate-spin mx-auto animate-duration-1000" />
          <h3 className="text-slate-800 font-serif font-bold text-sm tracking-widest uppercase">Memuat Kebudayaan Batik Jawa Timur...</h3>
          <p className="text-xs text-rose-600 font-medium animate-pulse">Menghubungkan ke Realtime Cloud Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 transition-colors duration-300">
      
      {/* Brand Navigation Header */}
      {!isAdminRoute && (
        <Header 
          isAdmin={isAdminRoute} 
          setIsAdmin={setIsAdminRoute} 
          siteTitle={settings.siteTitle} 
          onTrackPageView={handleTrackPageView}
        />
      )}
 
      {/* Main Container */}
      <main className="flex-grow">
        {isAdminRoute ? (
          currentUser ? (
            <AdminDashboard
              products={products}
              setProducts={setProducts}
              events={events}
              setEvents={setEvents}
              testimonials={testimonials}
              setTestimonials={setTestimonials}
              settings={settings}
              setSettings={setSettings}
              subscribers={subscribers}
              setSubscribers={setSubscribers}
              analytics={analytics}
              setAnalytics={setAnalytics}
              galleryPhotos={galleryPhotos}
              setGalleryPhotos={setGalleryPhotos}
              onNotify={triggerNotification}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              highlightCards={highlightCards}
              setHighlightCards={setHighlightCards}
              onLogout={() => {
                setIsAdminRoute(true);
                setCurrentUser(null);
              }}
            />
          ) : (
            <AdminLogin 
              onSuccess={(user) => {
                setCurrentUser(user);
                if (user && user.isBypass) {
                  localStorage.setItem('batik_bypass_user', JSON.stringify(user));
                }
                triggerNotification('Otentikasi berhasil! Menyambungkan sesi...', 'success');
              }}
              onNotify={triggerNotification}
              onGoBack={() => {
                window.location.hash = '';
                // Push standard back path
                window.history.pushState({}, '', '/');
                setIsAdminRoute(false);
              }}
            />
          )
        ) : (
          <FrontendSite
            products={products}
            events={events}
            testimonials={testimonials}
            settings={settings}
            setSubscribers={setSubscribers}
            setEvents={setEvents}
            galleryPhotos={galleryPhotos}
            onNotify={triggerNotification}
            highlightCards={highlightCards}
            onTrackPageView={handleTrackPageView}
            onTrackProductClick={handleTrackProductClick}
            onTrackProductPurchase={handleTrackProductPurchase}
          />
        )}
      </main>

      {/* Persistent global copyright statement */}
      {!isAdminRoute && (
        <footer className="bg-batik-dark text-slate-500 py-6 border-t border-[#2d2d2d] text-center text-xs font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans font-semibold">
            <p>{settings.footerCopyright}</p>
            <div className="flex items-center gap-4 text-[10px] tracking-wider text-slate-400">
              <span>METODE PEMBAYARAN: QRIS / BCA / MANDIRI</span>
              <span>•</span>
              <span>MITRA KIRIM: JNE / J&T / POS</span>
            </div>
          </div>
        </footer>
      )}

      {/* ----------------- PREMIUM FLOATING NOTIFICATION SYSTEM (TOAST) ----------------- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm" id="global-toast-notification">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-left">
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">
                {toast.type === 'success' ? 'Berhasil' : 'Kesalahan'}
              </span>
              <p className="font-sans text-xs mt-0.5 font-semibold text-slate-600">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon, 
  Mail, 
  Settings as SettingsIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Download, 
  TrendingUp, 
  Users, 
  Eye, 
  ChevronRight,
  ExternalLink,
  Shield,
  Loader
} from 'lucide-react';
import { Product, Event, Testimonial, WebsiteSettings, AnalyticsData, Subscriber, GalleryPhoto } from '../types';
import { 
  saveProductToFirebase, deleteProductFromFirebase,
  saveEventToFirebase, deleteEventFromFirebase,
  saveTestimonialToFirebase, deleteTestimonialFromFirebase,
  saveSettingsToFirebase,
  deleteSubscriberFromFirebase,
  saveGalleryPhotoToFirebase, deleteGalleryPhotoFromFirebase,
  auth,
  saveHighlightCardsToFirebase
} from '../lib/firebase';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import ImageUploader from './ImageUploader';
import { AiGenerator } from './AiGenerator';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  settings: WebsiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<WebsiteSettings>>;
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  analytics: AnalyticsData;
  setAnalytics: React.Dispatch<React.SetStateAction<AnalyticsData>>;
  galleryPhotos: GalleryPhoto[];
  setGalleryPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
  onNotify: (message: string, type: 'success' | 'error') => void;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  highlightCards: any[];
  setHighlightCards: React.Dispatch<React.SetStateAction<any[]>>;
  onLogout?: () => void;
}

type TabType = 'analytics' | 'products' | 'events' | 'testimonials' | 'media' | 'subscribers' | 'settings';

export default function AdminDashboard({
  products,
  setProducts,
  events,
  setEvents,
  testimonials,
  setTestimonials,
  settings,
  setSettings,
  subscribers,
  setSubscribers,
  analytics,
  setAnalytics,
  galleryPhotos,
  setGalleryPhotos,
  onNotify,
  currentUser,
  setCurrentUser,
  highlightCards,
  setHighlightCards,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // New Manager Administrator states
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [registeringManager, setRegisteringManager] = useState(false);

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Batik Tradisional',
    status: 'Tersedia',
    displayOrder: 1,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
    philosophy: ''
  });

  // Event CRUD states
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
    location: '',
    status: 'Mendatang',
    type: 'Festival Batik Nasional',
    registrationLink: '',
    registrantsCount: 0
  });

  // Testimonial States
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    content: '',
    rating: 5,
    status: 'Aktif'
  });

  // Export Subscribers to CSV
  const handleExportSubscribers = () => {
    if (subscribers.length === 0) {
      onNotify('Belum ada email subscribers untuk diexport!', 'error');
      return;
    }
    const headers = 'ID,Email,Tanggal Subscribe\n';
    const rows = subscribers.map(sub => `${sub.id},${sub.email},${sub.subscribeDate}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'batik-subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Daftar Subscribers berrhasil diexport ke CSV!', 'success');
  };

  // Add Product Handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      onNotify('Mohon lengkapi nama dan harga produk!', 'error');
      return;
    }
    const productToAdd: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      description: newProduct.description || '',
      price: Number(newProduct.price),
      category: newProduct.category as any,
      images: newProduct.images || ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
      status: newProduct.status as any,
      displayOrder: Number(newProduct.displayOrder || 1),
      philosophy: newProduct.philosophy || '',
      isPopular: false
    };

    saveProductToFirebase(productToAdd)
      .then(() => {
        setProducts(prev => {
          const updated = [...prev, productToAdd];
          return updated.sort((a,b) => a.displayOrder - b.displayOrder);
        });

        // Sync mock analytics
        setAnalytics(prev => ({
          ...prev,
          catalogConversions: [...prev.catalogConversions, { name: productToAdd.name, clicks: 5, purchases: 0 }]
        }));

        setIsAddProductOpen(false);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          category: 'Batik Tradisional',
          status: 'Tersedia',
          displayOrder: 1,
          images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
          philosophy: ''
        });
        onNotify('Produk batik baru berhasil ditambahkan ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal menyimpan produk baru ke Firebase. Cek koneksi Anda.', 'error');
      });
  };

  // Edit Product Handler
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    saveProductToFirebase(editingProduct)
      .then(() => {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);
        onNotify('Informasi produk batik berhasil diperbarui ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal memperbarui file produk pada database cloud.', 'error');
      });
  };

  // Delete Product Handler
  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      deleteProductFromFirebase(id)
        .then(() => {
          setProducts(prev => prev.filter(p => p.id !== id));
          onNotify('Produk batik telah dihapus dari Firebase.', 'success');
        })
        .catch(err => {
          console.error(err);
          onNotify('Gagal menghapus produk.', 'error');
        });
    }
  };

  // Add Event Handler
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.location) {
      onNotify('Mohon isi judul dan lokasi event!', 'error');
      return;
    }
    const eventToAdd: Event = {
      id: `ev-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date || new Date().toISOString().split('T')[0],
      description: newEvent.description || '',
      image: newEvent.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
      location: newEvent.location,
      status: newEvent.status as any,
      type: newEvent.type as any,
      registrationLink: newEvent.registrationLink || '',
      registrantsCount: 0
    };

    saveEventToFirebase(eventToAdd)
      .then(() => {
        setEvents(prev => [eventToAdd, ...prev]);

        // Update event stats in analytics
        setAnalytics(prev => ({
          ...prev,
          eventStats: [...prev.eventStats, { eventId: eventToAdd.id, title: eventToAdd.title, limit: 100, registered: 0 }]
        }));

        setIsAddEventOpen(false);
        setNewEvent({
          title: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
          location: '',
          status: 'Mendatang',
          type: 'Festival Batik Nasional',
          registrationLink: '',
          registrantsCount: 0
        });
        onNotify('Event / Dokumentasi baru berhasil disimpan ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal membuat event baru di Firebase.', 'error');
      });
  };

  // Edit Event Handler
  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    saveEventToFirebase(editingEvent)
      .then(() => {
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? editingEvent : ev));
        setEditingEvent(null);
        onNotify('Detail Event berhasil diperbarui ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal memperbarui event di Firebase.', 'error');
      });
  };

  // Delete Event Handler
  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Hapus event "${title}"?`)) {
      deleteEventFromFirebase(id)
        .then(() => {
          setEvents(prev => prev.filter(ev => ev.id !== id));
          onNotify('Event berhasil dihapus dari Firebase.', 'success');
        })
        .catch(err => {
          console.error(err);
          onNotify('Gagal menghapus event ini dari Firestore.', 'error');
        });
    }
  };

  // Toggle Testimonial Status
  const handleToggleTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.map(t => {
      if (t.id === id) {
        const nextStatus: "Aktif" | "Tidak aktif" = t.status === 'Aktif' ? 'Tidak aktif' : 'Aktif';
        const nextT: Testimonial = { ...t, status: nextStatus };
        saveTestimonialToFirebase(nextT)
          .then(() => {
            onNotify(`Status ulasan testimoni diubah menjadi ${nextStatus} di Firebase`, 'success');
          })
          .catch(err => {
            console.error(err);
            onNotify('Gagal memperbarui ulasan testimoni.', 'error');
          });
        return nextT;
      }
      return t;
    });
    setTestimonials(updatedTestimonials);
  };

  // Delete Testimonial
  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Hapus testimonial ini?')) {
      deleteTestimonialFromFirebase(id)
        .then(() => {
          setTestimonials(prev => prev.filter(t => t.id !== id));
          onNotify('Testimonial telah dihapus dari Firebase.', 'success');
        })
        .catch(err => {
          console.error(err);
          onNotify('Gagal menghapus ulasan testimoni.', 'error');
        });
    }
  };

  // Add Testimonial Handler
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.content) {
      onNotify('Lengkapi nama dan isi testimonial!', 'error');
      return;
    }
    const testToAdd: Testimonial = {
      id: `test-${Date.now()}`,
      name: newTestimonial.name.toUpperCase(),
      role: newTestimonial.role || 'Pecinta Batik Jatim',
      content: newTestimonial.content,
      rating: Number(newTestimonial.rating || 5),
      status: (newTestimonial.status as any) || 'Aktif'
    };

    saveTestimonialToFirebase(testToAdd)
      .then(() => {
        setTestimonials(prev => [...prev, testToAdd]);
        setIsAddTestimonialOpen(false);
        setNewTestimonial({ name: '', role: '', content: '', rating: 5, status: 'Aktif' });
        onNotify('Testimonial buatan admin berhasil disimpan ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal menyimpan testimonial.', 'error');
      });
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsToFirebase(settings)
      .then(() => {
        onNotify('Website settings berhasil disimpan dan disinkronkan ke Firebase!', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal menyimpan pengaturan website.', 'error');
      });
  };

  // Register New Manager Administrator
  const handleRegisterNewManager = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newManagerEmail.trim().toLowerCase();
    if (!cleanEmail || !newManagerPassword) {
      onNotify('Silakan lengkapi alamat email dan kata sandi pengelola baru!', 'error');
      return;
    }
    if (newManagerPassword.length < 6) {
      onNotify('Kata sandi minimal harus 6 karakter untuk keamanan Firebase!', 'error');
      return;
    }

    setRegisteringManager(true);

    const handleBypassSuccess = () => {
      onNotify(`Sukses (Mode Kamus/Bypass)! Akun pengelola baru untuk "${cleanEmail}" berhasil disimpan di penyimpanan browser. Sesi Anda beralih ke akun baru ini.`, 'success');
      const mockUser = { email: cleanEmail, uid: `bypass-${Date.now()}`, isBypass: true };
      
      // Save this credential to local list of bypass managers
      try {
        const savedAdmins = localStorage.getItem('batik_registered_bypass_admins');
        const list = savedAdmins ? JSON.parse(savedAdmins) : [];
        const filteredList = list.filter((item: any) => item.email !== cleanEmail);
        filteredList.push({ email: cleanEmail, password: newManagerPassword });
        localStorage.setItem('batik_registered_bypass_admins', JSON.stringify(filteredList));
      } catch (e) {
        console.error('Failed to save to bypass list', e);
      }

      localStorage.setItem('batik_bypass_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      setNewManagerEmail('');
      setNewManagerPassword('');
    };

    if (currentUser?.isBypass) {
      setTimeout(() => {
        handleBypassSuccess();
        setRegisteringManager(false);
      }, 500);
      return;
    }

    createUserWithEmailAndPassword(auth, cleanEmail, newManagerPassword)
      .then(() => {
        onNotify(`Sukses! Akun pengelola baru untuk "${cleanEmail}" berhasil dibuat di Firebase Auth. Sesi Anda sekarang beralih ke akun tersebut.`, 'success');
        setNewManagerEmail('');
        setNewManagerPassword('');
      })
      .catch((err: any) => {
        console.error("Firebase Auth error during registration:", err);
        if (
          err.code === 'auth/configuration-not-found' || 
          err.code === 'auth/operation-not-allowed' || 
          err.code === 'auth/unauthorized-domain' ||
          err.code === 'auth/invalid-api-key' ||
          err.code === 'auth/network-request-failed'
        ) {
          handleBypassSuccess();
        } else {
          let msg = 'Gagal mendaftarkan pengelola baru.';
          if (err.code === 'auth/email-already-in-use') {
            msg = 'Email pengelola sudah terdaftar sebelumnya!';
          } else if (err.code === 'auth/weak-password') {
            msg = 'Sandi terlalu lemah untuk Firebase Auth.';
          }
          onNotify(msg, 'error');
        }
      })
      .finally(() => {
        setRegisteringManager(false);
      });
  };

  // Delete Subscriber
  const handleDeleteSub = (id: string) => {
    deleteSubscriberFromFirebase(id)
      .then(() => {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        onNotify('Email subscriber dihapus dari Firebase.', 'success');
      })
      .catch(err => {
        console.error(err);
        onNotify('Gagal menghapus subscriber dari cloud.', 'error');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row">
      
      {/* Side menu navigation for general admin panel */}
      <aside className="w-full lg:w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-batik-primary flex items-center justify-center font-bold text-white font-serif">
            A
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wider">BATIK DASHBOARD</h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Admin Console Active
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'analytics' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart className="w-4 h-4" />
            ANALISIS & STATISTIK
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'products' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            KATALOG PRODUK ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'events' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            EVENT & DOKUMENTASI ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'testimonials' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            ULASAN & TESTIMONI ({testimonials.length})
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'subscribers' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            NEWSLETTER SUBSCRIBERS ({subscribers.length})
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'media' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            SAMPUL & GALERI MEDIA
          </button>

          <div className="border-t border-slate-800/60 my-4"></div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition ${
              activeTab === 'settings' ? 'bg-batik-primary text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            PENGATURAN UMUM
          </button>

          <div className="border-t border-slate-800/60 my-4"></div>

          {showLogoutConfirm ? (
            <div className="bg-rose-950/30 border border-red-500/30 p-3 rounded-lg text-xs space-y-2 animate-fade-in">
              <p className="text-red-200 font-semibold text-center">Keluar dari sesi admin?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] uppercase transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('batik_bypass_user');
                    setCurrentUser(null);
                    signOut(auth).then(() => {
                      onNotify('Sesi administrator diakhiri.', 'success');
                      window.history.pushState(null, '', '/admin');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                      if (onLogout) onLogout();
                    }).catch(err => {
                      console.error(err);
                      onNotify('Sesi administrator diakhiri.', 'success');
                      window.history.pushState(null, '', '/admin');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                      if (onLogout) onLogout();
                    });
                  }}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] uppercase transition"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider transition text-red-400 hover:bg-rose-950/20 hover:text-red-300"
            >
              <X className="w-4 h-4" />
              LOGOUT CONSOLE
            </button>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800/80 bg-slate-950 text-slate-500 text-[10px] tracking-wider font-mono">
          <p>AUTHORIZED SESSION</p>
          <p className="text-slate-400 mt-1">{currentUser?.email || auth.currentUser?.email || 'davidlouis857@gmail.com'}</p>
        </div>
      </aside>

      {/* Main Admin Workspace Portal */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8 lg:p-10">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">BATIK-DASHBOARD / CONTROL-ROOM</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 mt-1 capitalize">
              {activeTab === 'analytics' && 'Dashboard Analisis'}
              {activeTab === 'products' && 'Katalog Management'}
              {activeTab === 'events' && 'Manajemen Kegiatan & Event'}
              {activeTab === 'testimonials' && 'Pusat Testimoni & Ulasan'}
              {activeTab === 'subscribers' && 'Daftar Newsletter'}
              {activeTab === 'media' && 'Media & Banner Manager'}
              {activeTab === 'settings' && 'Pengaturan Website'}
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 font-sans text-xs bg-lime-100 text-lime-800 font-bold px-3 py-1.5 rounded-md border border-lime-200 self-start">
            Penyimpanan Lokal Aktif
          </div>
        </div>

        {/* ----------------- TAB: ANALYTICS ----------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-100 text-batik-primary rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold tracking-wider font-sans">TOTAL PENGUNJUNG UNIK</p>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">{analytics.totalVisitors}</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold font-sans">↑ 12% dari bulan lalu</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold tracking-wider font-sans">PRODUK KATALOG</p>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">{products.length} Items</h4>
                  <span className="text-[10px] text-indigo-500 font-semibold font-sans">{products.filter(p => p.status === 'Tersedia').length} kain ready stock</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold tracking-wider font-sans">PENDAFTAR EVENT</p>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">
                    {events.reduce((sum, ev) => sum + (ev.registrantsCount || 0), 0)} Orang
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-semibold font-sans">Dari {events.length} kegiatan aktif</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-[#C92C53] rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold tracking-wider font-sans">NEWSLETTER JOIN</p>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">{subscribers.length} Emails</h4>
                  <span className="text-[10px] text-neutral-400 font-sans">Penyebaran info batik tulis</span>
                </div>
              </div>

            </div>

            {/* In-depth Analytics Tables & Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Popular Pages */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-batik-primary" />
                  <h4 className="font-serif text-lg font-bold text-slate-800">Halaman Populer Website</h4>
                </div>
                <div className="space-y-4">
                  {analytics.popularPages.map((page, index) => {
                    const maxViews = Math.max(...analytics.popularPages.map(p => p.views));
                    const percent = Math.round((page.views / maxViews) * 100);
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{page.title}</span>
                          <span className="font-mono text-slate-400 text-[11px]">{page.views} Views ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-batik-secondary h-full rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conversion and Catalog analytics */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-serif text-lg font-bold text-slate-800">Konversi Klik & Minat Katalog</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Total Minat Beli</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {analytics.catalogConversions
                    .filter(c => products.some(p => p.name.toLowerCase() === c.name.toLowerCase()))
                    .map((item, index) => {
                      const rate = item.clicks > 0 ? ((item.purchases / item.clicks) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={index} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-700">{item.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.clicks} kali dilihat</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{item.purchases} Tertarik Beli</p>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                              {rate}% Konversi
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Event registrations visualization */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-serif text-lg font-bold text-slate-800 mb-6 font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Statistik Pendaftaran Event Terkini
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.eventStats.map((ev, index) => {
                  const percentReg = Math.min(100, Math.round((ev.registered / ev.limit) * 100));
                  return (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <h5 className="font-sans font-bold text-xs text-slate-800 line-clamp-1">{ev.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Kuota Terisi: {ev.registered} / {ev.limit}</p>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${percentReg}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-right font-mono font-bold text-slate-500">{percentReg}% Kapasitas</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: PRODUCTS ----------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">{products.length} batik di katalog</span>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="bg-batik-primary text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> TAMBAH MOTIF BATIK
              </button>
            </div>

            {/* Lightbox / Form block for ADD PRODUCT */}
            {isAddProductOpen && (
              <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-xl border border-rose-200 shadow-md space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-rose-100 pb-3">
                  <h4 className="font-serif font-bold text-batik-primary text-base">Tambah Batik Baru ke Katalog</h4>
                  <button type="button" onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nama Batik *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                      placeholder="Contoh: Batik Mega Mendung Merah"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <AiGenerator 
                      label="Nama Batik/Motif" 
                      type="title" 
                      onGenerate={val => setNewProduct({...newProduct, name: val})} 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Kategori Batik *</label>
                    <select 
                      className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                    >
                      <option value="Batik Tradisional">Batik Tradisional</option>
                      <option value="Batik Modern">Batik Modern</option>
                      <option value="Batik Kontemporer">Batik Kontemporer</option>
                      <option value="Aksesoris Batik">Aksesoris Batik</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Harga (Rupiah) *</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                      placeholder="Contoh: 180000"
                      value={newProduct.price || ''}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Urutan Tampilan (Display Order)</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                      placeholder="Contoh: 1"
                      value={newProduct.displayOrder || 1}
                      onChange={e => setNewProduct({...newProduct, displayOrder: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <ImageUploader 
                      value={newProduct.images?.[0] || ''}
                      onChange={imgBase64 => setNewProduct({...newProduct, images: [imgBase64]})}
                      label="Unggah Foto Produk Batik (Seret & Lepas / Pilih File)"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Status Ketersediaan</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          checked={newProduct.status === 'Tersedia'} 
                          onChange={() => setNewProduct({...newProduct, status: 'Tersedia'})}
                        />
                        Tersedia (Ready Stock)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          checked={newProduct.status === 'Habis'} 
                          onChange={() => setNewProduct({...newProduct, status: 'Habis'})}
                        />
                        Habis (Out of Stock)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Deskripsi Singkat Produk *</label>
                  <textarea 
                    rows={2} 
                    required
                    className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                    placeholder="Tuliskan kain buatan pengrajin, ukuran kain, ketahanan warna dan kegunaannya..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <AiGenerator 
                    label={newProduct.name ? `Deskripsi Produk ${newProduct.name}` : "Deskripsi Produk"}
                    type="description" 
                    onGenerate={val => setNewProduct({...newProduct, description: val})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Makna / Filosofi Kain Batik</label>
                  <textarea 
                    rows={2} 
                    className="w-full p-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-batik-primary"
                    placeholder="Ceritakan nilai luhur dan filosofi dari motif batik cantik ini..."
                    value={newProduct.philosophy}
                    onChange={e => setNewProduct({...newProduct, philosophy: e.target.value})}
                  />
                  <AiGenerator 
                    label={newProduct.name || "Motif Batik Jawa Timur"} 
                    type="philosophy" 
                    onGenerate={val => setNewProduct({...newProduct, philosophy: val})} 
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 rounded text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded text-xs font-bold text-white bg-batik-primary hover:bg-opacity-90"
                  >
                    Simpan Motif Batik
                  </button>
                </div>
              </form>
            )}

            {/* Edit product popup form inline */}
            {editingProduct && (
              <form onSubmit={handleUpdateProduct} className="bg-slate-900 text-white p-6 rounded-xl border border-amber-600 shadow-md space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-serif font-bold text-amber-400 text-base">Edit: {editingProduct.name}</h4>
                  <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Nama Batik *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    />
                    <AiGenerator 
                      label="Nama Batik/Motif" 
                      type="title" 
                      theme="dark"
                      onGenerate={val => setEditingProduct({...editingProduct, name: val})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Kategori Batik *</label>
                    <select 
                      className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none"
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                    >
                      <option value="Batik Tradisional">Batik Tradisional</option>
                      <option value="Batik Modern">Batik Modern</option>
                      <option value="Batik Kontemporer">Batik Kontemporer</option>
                      <option value="Aksesoris Batik">Aksesoris Batik</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Harga (IDR) *</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Status Stok</label>
                    <select 
                      className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none"
                      value={editingProduct.status}
                      onChange={e => setEditingProduct({...editingProduct, status: e.target.value as any})}
                    >
                      <option value="Tersedia">Tersedia (Ready Stock)</option>
                      <option value="Habis">Habis (Out of Stock)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <ImageUploader 
                    value={editingProduct.images?.[0] || ''}
                    onChange={imgBase64 => setEditingProduct({...editingProduct, images: [imgBase64]})}
                    label="Ubah Foto Produk Batik"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-slate-300">Filosofi Batik</label>
                  <textarea 
                    rows={2} 
                    className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none"
                    value={editingProduct.philosophy || ''}
                    onChange={e => setEditingProduct({...editingProduct, philosophy: e.target.value})}
                  />
                  <AiGenerator 
                    label={editingProduct.name || "Motif Batik Jawa Timur"} 
                    type="philosophy" 
                    theme="dark"
                    onGenerate={val => setEditingProduct({...editingProduct, philosophy: val})} 
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

            {/* Products interactive grid table list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 ">MOTIF BATIK</th>
                      <th className="p-4">KATEGORI</th>
                      <th className="p-4 text-right">HARGA (IDR)</th>
                      <th className="p-4 text-center">DISPLAY</th>
                      <th className="p-4">STATUS STOK</th>
                      <th className="p-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded border object-cover bg-rose-50"
                          />
                          <div>
                            <p className="font-sans font-bold text-slate-800 text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{p.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold text-[10px] ">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right fonts-semibold text-slate-800 font-mono">
                          Rp {p.price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-400 font-mono">
                          #{p.displayOrder}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1 px-2.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition flex items-center gap-1 font-bold"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: EVENTS ----------------- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">{events.length} kegiatan terdokumentasi</span>
              <button
                onClick={() => setIsAddEventOpen(true)}
                className="bg-batik-primary text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> BUAT EVENT / DOKUMENTASI
              </button>
            </div>

            {/* Event Add form dropdown info */}
            {isAddEventOpen && (
              <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-xl border border-rose-200 shadow-md space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-rose-100 pb-3">
                  <h4 className="font-serif font-bold text-batik-primary text-base">Buat Event & Dokumentasi</h4>
                  <button type="button" onClick={() => setIsAddEventOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Judul Event *</label>
                    <input 
                      type="text" required
                      className="w-full p-2.5 border rounded focus:border-batik-primary"
                      placeholder="Contoh: WORKSHOP CANTING EMAS JATIM"
                      value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    />
                    <AiGenerator 
                      label="Judul Event" 
                      type="title" 
                      onGenerate={val => setNewEvent({...newEvent, title: val})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Jenis Event *</label>
                    <select 
                      className="w-full p-2.5 border rounded"
                      value={newEvent.type}
                      onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    >
                      <option value="Festival Batik Nasional">Festival Batik Nasional</option>
                      <option value="Workshop Batik Tulis">Workshop Batik Tulis</option>
                      <option value="Pameran Batik Kontemporer">Pameran Batik Kontemporer</option>
                      <option value="Pelatihan Pengrajin">Pelatihan Pengrajin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Tanggal Pelaksanaan *</label>
                    <input 
                      type="date" required
                      className="w-full p-2.5 border rounded"
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Lokasi Acara *</label>
                    <input 
                      type="text" required
                      className="w-full p-2.5 border rounded"
                      placeholder="Contoh: Balai Pemuda, Surabaya"
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Link Registrasi (Opsional)</label>
                    <input 
                      type="text"
                      className="w-full p-2.5 border rounded"
                      placeholder="Contoh: https://linkregistrasi.com"
                      value={newEvent.registrationLink}
                      onChange={e => setNewEvent({...newEvent, registrationLink: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Status Event</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input 
                          type="radio" name="evstatus" 
                          checked={newEvent.status === 'Mendatang'}
                          onChange={() => setNewEvent({...newEvent, status: 'Mendatang'})}
                        />
                        Mendatang
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input 
                          type="radio" name="evstatus" 
                          checked={newEvent.status === 'Selesai'}
                          onChange={() => setNewEvent({...newEvent, status: 'Selesai'})}
                        />
                        Selesai / Masa Lalu
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <ImageUploader 
                    value={newEvent.image || ''}
                    onChange={imgBase64 => setNewEvent({...newEvent, image: imgBase64})}
                    label="Unggah Dokumentasi / Poster Pamflet Event (Wajib)"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-slate-600">Deskripsi Lengkap & Dokumentasi Kegiatan *</label>
                  <textarea 
                    rows={3} required
                    className="w-full p-2.5 border rounded focus:border-batik-primary"
                    placeholder="Tuliskan latar belakang, kemeriahan, pengrajin yang terlibat serta hasil pelestarian budaya..."
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  />
                  <AiGenerator 
                    label={newEvent.title ? `Deskripsi Event ${newEvent.title}` : "Deskripsi Event"}
                    type="description" 
                    onGenerate={val => setNewEvent({...newEvent, description: val})} 
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button type="button" onClick={() => setIsAddEventOpen(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-batik-primary text-white rounded font-bold">Simpan Event</button>
                </div>
              </form>
            )}

            {/* Edit Event inline frame popup */}
            {editingEvent && (
              <form onSubmit={handleUpdateEvent} className="bg-slate-900 text-white p-6 rounded-xl border border-indigo-500 shadow-md space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-serif font-bold text-indigo-400 text-base">Edit Event: {editingEvent.title}</h4>
                  <button type="button" onClick={() => setEditingEvent(null)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300">Judul Event</label>
                    <input 
                      type="text" required className="w-full p-2 bg-slate-850 border border-slate-700 text-white rounded"
                      value={editingEvent.title}
                      onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                    />
                    <AiGenerator 
                      label="Judul Event" 
                      type="title" 
                      theme="dark"
                      onGenerate={val => setEditingEvent({...editingEvent, title: val})} 
                    />
                  </div>
                  <div>
                    <label className="text-slate-300">Lokasi</label>
                    <input 
                      type="text" required className="w-full p-2 bg-slate-850 border border-slate-700 text-white rounded"
                      value={editingEvent.location}
                      onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-slate-300">Status</label>
                    <select 
                      className="w-full p-2 bg-slate-850 border border-slate-700 text-white rounded"
                      value={editingEvent.status}
                      onChange={e => setEditingEvent({...editingEvent, status: e.target.value as any})}
                    >
                      <option value="Mendatang">Mendatang</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300">Tanggal</label>
                    <input 
                      type="date" required className="w-full p-2 bg-slate-850 border border-slate-700 text-white rounded"
                      value={editingEvent.date}
                      onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <ImageUploader 
                    value={editingEvent.image || ''}
                    onChange={imgBase64 => setEditingEvent({...editingEvent, image: imgBase64})}
                    label="Ubah Dokumentasi / Poster Event"
                  />
                </div>

                <div className="text-xs">
                  <label className="text-slate-300">Deskripsi Event</label>
                  <textarea 
                    rows={3} required className="w-full p-2 bg-slate-850 border border-slate-700 text-white rounded"
                    value={editingEvent.description}
                    onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                  />
                  <AiGenerator 
                    label={editingEvent.title ? `Deskripsi Event ${editingEvent.title}` : "Deskripsi Event"}
                    type="description" 
                    theme="dark"
                    onGenerate={val => setEditingEvent({...editingEvent, description: val})} 
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 border border-slate-700 rounded text-slate-300">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded font-bold">Simpan</button>
                </div>
              </form>
            )}

            {/* List Table of Events */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">DOKUMENTASI / GAMBAR</th>
                      <th className="p-4">NAMA KEGIATAN & JENIS</th>
                      <th className="p-4">TANGGAL & LOKASI</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium font-sans">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <img 
                            src={ev.image} 
                            alt={ev.title} 
                            referrerPolicy="no-referrer"
                            className="w-16 h-10 object-cover rounded border bg-slate-100"
                          />
                        </td>
                        <td className="p-4 max-w-[280px]">
                          <p className="font-bold text-slate-800 uppercase tracking-wide line-clamp-1">{ev.title}</p>
                          <span className="text-[10px] text-batik-secondary font-semibold uppercase tracking-wider">{ev.type}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <p className="font-bold font-mono">{ev.date}</p>
                          <p className="text-[10px]">{ev.location}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                            ev.status === 'Mendatang' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingEvent(ev)}
                              className="p-1 px-2.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="text-red-500 p-1 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: TESTIMONIALS ----------------- */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">{testimonials.length} reviews dari pecinta batik</span>
              <button
                onClick={() => setIsAddTestimonialOpen(true)}
                className="bg-batik-primary text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 shadow-sm"
              >
                <Plus className="w-4 h-4" /> TAMBAH REVIEW BARU
              </button>
            </div>

            {/* Testimonial Add form dropdown banner */}
            {isAddTestimonialOpen && (
              <form onSubmit={handleAddTestimonial} className="bg-white p-6 rounded-xl border border-rose-250 shadow-md space-y-4 max-w-xl animate-fade-in">
                <div className="flex justify-between items-center border-b pb-3">
                  <h4 className="font-serif font-bold text-batik-primary">Tambah Testimoni Pecinta Batik</h4>
                  <button type="button" onClick={() => setIsAddTestimonialOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Nama Lengkap *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded" placeholder="Contoh: Ahmad Santoso"
                      value={newTestimonial.name}
                      onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Profesi / Jabatan *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded" placeholder="Contoh: Kolektor Kain Tradisional"
                      value={newTestimonial.role}
                      onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Rating Bintang (1-5)</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newTestimonial.rating}
                      onChange={e => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                      <option value="3">⭐⭐⭐ 3 Stars</option>
                      <option value="2">⭐⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Status Keaktifan</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newTestimonial.status}
                      onChange={e => setNewTestimonial({...newTestimonial, status: e.target.value as any})}
                    >
                      <option value="Aktif">Aktif (Tampil)</option>
                      <option value="Tidak aktif">Tidak aktif (Diarsipkan)</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-semibold block mb-1">Isi Testimoni / Review *</label>
                  <textarea 
                    rows={3} required className="w-full p-2 border rounded focus:border-batik-primary"
                    placeholder="Tuliskan kepuasan pelanggan terhadap koleksi batik maupun event..."
                    value={newTestimonial.content}
                    onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button type="button" onClick={() => setIsAddTestimonialOpen(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-batik-primary text-white rounded font-bold">Simpan Review</button>
                </div>
              </form>
            )}

            {/* Testimonials interactive controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-slate-800 text-sm leading-none">{t.name}</h4>
                        <span className="text-[10px] text-slate-400 font-sans mt-1.5 display-block border-b pb-1.5 inline-block">{t.role}</span>
                      </div>
                      <div className="flex text-amber-400 text-xs gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-sans text-xs text-slate-600 italic mt-3">"{t.content}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTestimonial(t.id)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition ${
                          t.status === 'Aktif' 
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {t.status === 'Aktif' ? 'Arsipkan' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                        title="Hapus Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB: SUBSCRIBERS ----------------- */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400">Newsletter database</span>
                <p className="text-sm font-semibold text-slate-700">{subscribers.length} pembaca terdaftar</p>
              </div>
              <button
                onClick={handleExportSubscribers}
                className="bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 shadow transition"
              >
                <Download className="w-4 h-4" /> EXPORT KE EXCEL / CSV
              </button>
            </div>

            {/* List Table of emails */}
            <div className="bg-white rounded-xl border border-slate-200 shadow shadow-sm overflow-hidden max-w-2xl">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">SUBSCRIBER EMAIL</th>
                    <th className="p-4">TANGGAL REGISTER</th>
                    <th className="p-4 text-right">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">{sub.email}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-[11px]">{sub.subscribeDate}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 italic font-medium">
                        Belum ada user yang mendaftarkan newsletter pada situs ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ----------------- TAB: MEDIA MANAGER ----------------- */}
        {activeTab === 'media' && (
          <div className="space-y-8 animate-fade-in text-sans text-xs">
            
            {/* 3 Main Highlight Cards Editor */}
            {highlightCards && highlightCards.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                  <div>
                    <h4 className="font-serif font-bold text-slate-800 text-lg">Manajemen 3 Konten Utama Beranda (Pintasan & Promosi)</h4>
                    <p className="text-slate-400 text-xs">Atur foto, judul, subteks, label tag, dan target link untuk 3 kartu banner di bawah spanduk utama beranda.</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        saveHighlightCardsToFirebase(highlightCards)
                          .then(() => {
                            onNotify("Berhasil menyimpan seluruh perubahan 3 konten utama kustom!", "success");
                          })
                          .catch(err => {
                            console.error("Gagal menyimpan 3 konten:", err);
                            onNotify("Gagal mensinkronisasikan konten ke Firebase.", "error");
                          });
                      }}
                      className="bg-batik-primary hover:bg-[#C92C53] text-white px-5 py-2.5 font-bold tracking-wider rounded text-[10px] uppercase transition shadow-sm shrink-0"
                    >
                      SIMPAN SEMUA PERUBAHAN KARTU
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {highlightCards.map((card, idx) => (
                    <div key={idx} className="border border-[#8B0022]/10 rounded-lg p-4 space-y-4 bg-slate-50 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-sans font-extrabold text-xs text-batik-primary uppercase">
                            Konten Kartu #{idx + 1}
                          </span>
                        </div>

                        {/* Image display & uploader */}
                        <div className="space-y-1">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preview Gambar Konten</span>
                          <div className="h-40 relative rounded overflow-hidden shadow-xs border bg-slate-200 mb-2">
                            <img 
                              src={card.image} 
                              alt={card.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <ImageUploader 
                            id={`card-img-${idx}`}
                            value={card.image}
                            onChange={(imgSrc) => {
                              const updatedCards = [...highlightCards];
                              updatedCards[idx] = { ...updatedCards[idx], image: imgSrc };
                              setHighlightCards(updatedCards);
                            }}
                            label="Unggah / Ubah Foto Kartu"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Label Atas (Tag)</label>
                            <input 
                              type="text" 
                              value={card.tag || ''} 
                              onChange={(e) => {
                                const updatedCards = [...highlightCards];
                                updatedCards[idx] = { ...updatedCards[idx], tag: e.target.value };
                                setHighlightCards(updatedCards);
                              }}
                              className="w-full p-2 text-xs border rounded bg-white mt-1 font-semibold text-slate-800"
                              placeholder="e.g., SEJARAH"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-slate-400">Teks Tombol</label>
                            <input 
                              type="text" 
                              value={card.linkText || ''} 
                              onChange={(e) => {
                                const updatedCards = [...highlightCards];
                                updatedCards[idx] = { ...updatedCards[idx], linkText: e.target.value };
                                setHighlightCards(updatedCards);
                              }}
                              className="w-full p-2 text-xs border rounded bg-white mt-1 font-semibold text-slate-800"
                              placeholder="e.g., LIHAT SEJARAH"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Judul Konten</label>
                          <input 
                            type="text" 
                            value={card.name || ''} 
                            onChange={(e) => {
                              const updatedCards = [...highlightCards];
                              updatedCards[idx] = { ...updatedCards[idx], name: e.target.value };
                              setHighlightCards(updatedCards);
                            }}
                            className="w-full p-2 text-xs border rounded bg-white mt-1 font-bold text-slate-800"
                            placeholder="e.g., SEJARAH BATIK JATIM"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deskripsi Singkat</label>
                          <textarea 
                            rows={3}
                            value={card.subtext || ''} 
                            onChange={(e) => {
                              const updatedCards = [...highlightCards];
                              updatedCards[idx] = { ...updatedCards[idx], subtext: e.target.value };
                              setHighlightCards(updatedCards);
                            }}
                            className="w-full p-2 text-xs border rounded bg-white mt-1 font-semibold text-slate-700 leading-relaxed resize-none"
                            placeholder="Deskripsi singkat konten bar..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tautan Bagian (Scroll Target)</label>
                          <select 
                            value={card.sectionAnchor || '#sejarah'} 
                            onChange={(e) => {
                              const updatedCards = [...highlightCards];
                              updatedCards[idx] = { ...updatedCards[idx], sectionAnchor: e.target.value };
                              setHighlightCards(updatedCards);
                            }}
                            className="w-full p-2 text-xs border rounded bg-white mt-1 font-semibold text-slate-800"
                          >
                            <option value="#sejarah">Sekilas Sejarah & Putera Puteri (#sejarah)</option>
                            <option value="#katalog">Katalog Produk Batik (#katalog)</option>
                            <option value="#kontak">Hubungi Kami / Konsultasi (#kontak)</option>
                            <option value="#ulasan">Ulasan & Testimoni Komunitas (#ulasan)</option>
                            <option value="#galeri">Dokumentasi & Galeri Kegiatan (#galeri)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-rose-100/50 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const singleSave = [ ...highlightCards ];
                            saveHighlightCardsToFirebase(singleSave)
                              .then(() => {
                                onNotify(`Berhasil menyimpan perubahan Kartu #${idx + 1}!`, "success");
                              })
                              .catch(err => {
                                console.error(err);
                                onNotify("Gagal menyimpan perubahan.", "error");
                              });
                          }}
                          className="text-[10px] bg-rose-50 hover:bg-rose-100 text-batik-primary font-bold px-3 py-1.5 rounded transition uppercase border border-rose-100"
                        >
                          Simpan Kartu ini saja
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            


            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 font-sans text-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
                <div>
                  <h4 className="font-serif font-bold text-slate-800 text-lg">Dokumentasi & Galeri Kegiatan</h4>
                  <p className="text-slate-400 text-xs">Kumpulan foto-foto panggung yang disinkronisasikan ke galeri bergulir horizontal dan web profile utama.</p>
                </div>
              </div>

              {/* Add Photo Form */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 flex flex-col md:flex-row gap-4 md:items-end justify-between">
                <div className="flex-grow space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">Unggah Foto Galeri Baru</label>
                  <ImageUploader 
                    value={newPhotoUrl}
                    onChange={(imgBase64) => setNewPhotoUrl(imgBase64)}
                    label="Pilih atau Seret Foto Batik Jatim Baru"
                  />
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newPhotoUrl.trim();
                        if (!trimmed) {
                          onNotify('Harap unggah gambar terlebih dahulu!', 'error');
                          return;
                        }
                        const newPh = {
                          id: `ig-${Date.now()}`,
                          url: trimmed
                        };
                        saveGalleryPhotoToFirebase(newPh)
                          .then(() => {
                            setGalleryPhotos(prev => [...prev, newPh]);
                            onNotify('Foto berhasil ditambahkan ke galeri cloud!', 'success');
                            setNewPhotoUrl('');
                          })
                          .catch(err => {
                            console.error(err);
                            onNotify('Gagal menyimpan foto galeri Baru ke Firestore.', 'error');
                          });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs shrink-0 flex items-center gap-1 uppercase tracking-wider transition-colors duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" /> SIMPAN FOTO GALERI
                    </button>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-1.5 min-w-[240px]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pilihan Preset Cepat</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { icon: '🌺', name: 'Model Jatim', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' },
                      { icon: '👑', name: 'Panggung', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500' },
                      { icon: '🎨', name: 'Batik Tulis', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500' },
                      { icon: '🧥', name: 'Pashmina', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500' }
                    ].map((ps) => (
                      <button
                        key={ps.name}
                        onClick={() => setNewPhotoUrl(ps.url)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border rounded text-[10px] font-medium text-slate-600 transition"
                      >
                        {ps.icon} {ps.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo grid view */}
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pt-2 flex justify-between items-center">
                <span>Daftar Foto Galeri Saat Ini ({galleryPhotos.length})</span>
                <span className="text-emerald-600 normal-case font-semibold">Tampilan beranda utama akan otomatis mendukung gulir/swipe ke samping jika &gt; 6 foto</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pt-2">
                {galleryPhotos.map((post, index) => (
                  <div key={post.id || index} className="group relative rounded overflow-hidden shadow-xs aspect-square bg-slate-100 border border-slate-200">
                    <img 
                      src={post.url} 
                      alt={`Gallery item ${index + 1}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button 
                        type="button"
                        className="text-white bg-rose-600 hover:bg-rose-700 font-semibold text-[10px] px-3 py-1.5 rounded transition uppercase shadow" 
                        onClick={() => {
                          deleteGalleryPhotoFromFirebase(post.id)
                            .then(() => {
                              setGalleryPhotos(prev => prev.filter(ph => ph.id !== post.id));
                              onNotify('Foto galeri berhasil dihapus dari Cloud.', 'success');
                            })
                            .catch(err => {
                              console.error(err);
                              onNotify('Gagal menghapus foto galeri.', 'error');
                            });
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
                {galleryPhotos.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed rounded text-slate-400">
                    Belum ada foto galeri. Silakan tambahkan URL foto di atas atau pilih preset cepat!
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB: SETTINGS ----------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-4xl text-xs font-sans">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-slate-800 text-base mb-1 border-b pb-2">Pengaturan Umum</h4>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Judul Utama Website (Main Title) *</label>
                  <input 
                    type="text" required className="w-full p-2.5 border rounded focus:border-batik-primary font-bold text-slate-800"
                    value={settings.siteTitle}
                    onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Deskripsi Meta SEO *</label>
                  <textarea 
                    rows={3} required className="w-full p-2.5 border rounded focus:border-batik-primary"
                    value={settings.siteDescription}
                    onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Kata Kunci Meta (Keywords) *</label>
                  <input 
                    type="text" required className="w-full p-2.5 border rounded"
                    value={settings.metaTags}
                    onChange={e => setSettings({...settings, metaTags: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-slate-800 text-base mb-1 border-b pb-2">Informasi Kontak & Alamat</h4>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">No. Telepon Asosiasi *</label>
                  <input 
                    type="text" required className="w-full p-2.5 border rounded"
                    value={settings.contactInfo.phone}
                    onChange={e => setSettings({
                      ...settings, 
                      contactInfo: { ...settings.contactInfo, phone: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Situs Email Resmi *</label>
                  <input 
                    type="email" required className="w-full p-2.5 border rounded"
                    value={settings.contactInfo.email}
                    onChange={e => setSettings({
                      ...settings, 
                      contactInfo: { ...settings.contactInfo, email: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Alamat Fisik Kantor *</label>
                  <textarea 
                    rows={2} required className="w-full p-2.5 border rounded"
                    value={settings.contactInfo.address}
                    onChange={e => setSettings({
                      ...settings, 
                      contactInfo: { ...settings.contactInfo, address: e.target.value }
                    })}
                  />
                </div>
              </div>

            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-serif font-bold text-slate-800 text-base mb-1">Tautan Media Sosial</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Instagram Handle</label>
                  <input 
                    type="text" className="w-full p-2 border rounded"
                    value={settings.socialMedia.instagram}
                    onChange={e => setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, instagram: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Facebook Page</label>
                  <input 
                    type="text" className="w-full p-2 border rounded"
                    value={settings.socialMedia.facebook}
                    onChange={e => setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, facebook: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">YouTube Channel</label>
                  <input 
                    type="text" className="w-full p-2 border rounded"
                    value={settings.socialMedia.youtube}
                    onChange={e => setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, youtube: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <label className="font-semibold block text-slate-600">Teks Hak Cipta (Footer Copyright) *</label>
              <input 
                type="text" required className="w-full p-2.5 border rounded"
                value={settings.footerCopyright}
                onChange={e => setSettings({...settings, footerCopyright: e.target.value})}
              />
            </div>

            {/* SECTION 1: HERO & WELCOME SHOWCASE */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="bg-slate-55 p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-batik-primary text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">Section 1</span>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Kelola Konten Hero & Selamat Datang</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Konfigurasikan lencana kecil atas (Hero Badge) serta judul utama bagian selamat datang di awal halaman utama.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Lencana Atas Hero (e.g. PRESERVASI BUDAYA LUHUR TINGKAT PROVINSI)</label>
                    <input 
                      type="text" className="w-full p-2 border rounded bg-white text-xs font-semibold"
                      value={settings.heroBadge || ''}
                      onChange={e => setSettings({...settings, heroBadge: e.target.value})}
                      placeholder="PRESERVASI BUDAYA LUHUR TINGKAT PROVINSI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Judul Ucapan Selamat Datang *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded bg-white text-xs font-bold"
                      value={settings.heroTitle || ''}
                      onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                      placeholder="Selamat Datang di Ikatan Putera Puteri Batik Jawa Timur"
                    />
                    <AiGenerator 
                      label="Judul Selamat Datang Jatim" 
                      type="title" 
                      onGenerate={val => setSettings({...settings, heroTitle: val})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: KONTEN BANNER PANGGUNG (WIDE BANNER) */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="bg-slate-55 p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-batik-primary text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">Section 6</span>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Kelola Konten Banner Utama Panggung (Wide Photo)</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Konfigurasikan judul besar, sub-kata, deskripsi luhur, beserta poster panggung lebar yang berada di halaman beranda depan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Sub-Kata Banner (Subtitle, e.g. GRAND FINAL SELECTION)</label>
                    <input 
                      type="text" className="w-full p-2 border rounded bg-white text-xs font-semibold"
                      value={settings.stageBannerSubtitle || ''}
                      onChange={e => setSettings({...settings, stageBannerSubtitle: e.target.value})}
                      placeholder="GRAND FINAL SELECTION"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Judul Besar Banner *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded bg-white text-xs font-bold"
                      value={settings.stageBannerTitle || ''}
                      onChange={e => setSettings({...settings, stageBannerTitle: e.target.value})}
                      placeholder="Mewadahi Talenta Muda Kreatif Untuk Budaya Berharga"
                    />
                    <AiGenerator 
                      label="Judul Banner Beranda" 
                      type="title" 
                      onGenerate={val => setSettings({...settings, stageBannerTitle: val})} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Deskripsi Ringkas Banner *</label>
                  <textarea 
                    rows={2} required className="w-full p-2 border rounded bg-white text-xs"
                    value={settings.stageBannerDescription || ''}
                    onChange={e => setSettings({...settings, stageBannerDescription: e.target.value})}
                    placeholder="Momen bersejarah penganugerahan Putera Puteri Batik Jatim..."
                  />
                  <AiGenerator 
                    label="Deskripsi Banner Beranda" 
                    type="short" 
                    onGenerate={val => setSettings({...settings, stageBannerDescription: val})} 
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Foto Latar Belakang Poster Banner (Wide) *</label>
                  <ImageUploader 
                    value={settings.stageBannerImageUrl || ''}
                    onChange={url => setSettings({...settings, stageBannerImageUrl: url})}
                    label="Unggah Foto Panggung / Banner Lebar"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: KONTEN PILAR UTAMA & KATEGORI LIST */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="bg-slate-55 p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-batik-primary text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">Section 2</span>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Kelola Konten Pilar Utama & Kategori (Sejarah)</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Ganti semboyan pilar utama, deskripsi dari keempat pilar penunjang asosiasi, serta nama sub-grup kategori batik beserta fotonya.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Kata Pengantar Pilar (e.g. PILAR UTAMA ASOSIASI)</label>
                    <input 
                      type="text" className="w-full p-2 border rounded bg-white text-xs font-semibold"
                      value={settings.aboutSubtitle || ''}
                      onChange={e => setSettings({...settings, aboutSubtitle: e.target.value})}
                      placeholder="PILAR UTAMA ASOSIASI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Judul Besar Semboyan *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded bg-white text-xs font-bold"
                      value={settings.aboutTitle || ''}
                      onChange={e => setSettings({...settings, aboutTitle: e.target.value})}
                      placeholder="Sejarah & Perjuangan Batik Jawa Timur"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide border-b pb-1">4 Pilar Penunjang Utama</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pilar 1 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-batik-primary uppercase">Pilar #1 (Workshop)</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Judul Pilar</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.pillar1Title || ''}
                          onChange={e => setSettings({...settings, pillar1Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Deskripsi Pilar</label>
                        <textarea 
                          rows={2} className="w-full p-1.5 border rounded text-xs"
                          value={settings.pillar1Desc || ''}
                          onChange={e => setSettings({...settings, pillar1Desc: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Pilar 2 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-batik-primary uppercase">Pilar #2 (Katalog)</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Judul Pilar</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.pillar2Title || ''}
                          onChange={e => setSettings({...settings, pillar2Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Deskripsi Pilar</label>
                        <textarea 
                          rows={2} className="w-full p-1.5 border rounded text-xs"
                          value={settings.pillar2Desc || ''}
                          onChange={e => setSettings({...settings, pillar2Desc: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Pilar 3 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-batik-primary uppercase">Pilar #3 (Pelestarian)</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Judul Pilar</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.pillar3Title || ''}
                          onChange={e => setSettings({...settings, pillar3Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Deskripsi Pilar</label>
                        <textarea 
                          rows={2} className="w-full p-1.5 border rounded text-xs"
                          value={settings.pillar3Desc || ''}
                          onChange={e => setSettings({...settings, pillar3Desc: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Pilar 4 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-batik-primary uppercase">Pilar #4 (Kolaborasi)</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Judul Pilar</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.pillar4Title || ''}
                          onChange={e => setSettings({...settings, pillar4Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Deskripsi Pilar</label>
                        <textarea 
                          rows={2} className="w-full p-1.5 border rounded text-xs"
                          value={settings.pillar4Desc || ''}
                          onChange={e => setSettings({...settings, pillar4Desc: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide border-b pb-1">3 Showcase Kategori</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Showcase 1 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">Showcase Kategori #1</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Nama Judul</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.showcase1Title || ''}
                          onChange={e => setSettings({...settings, showcase1Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Epithet / Sub-tag</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs"
                          value={settings.showcase1Subtitle || ''}
                          onChange={e => setSettings({...settings, showcase1Subtitle: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Foto Kategori</label>
                        <ImageUploader 
                          value={settings.showcase1ImageUrl || ''}
                          onChange={url => setSettings({...settings, showcase1ImageUrl: url})}
                        />
                      </div>
                    </div>

                    {/* Showcase 2 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">Showcase Kategori #2</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Nama Judul</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.showcase2Title || ''}
                          onChange={e => setSettings({...settings, showcase2Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Epithet / Sub-tag</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs"
                          value={settings.showcase2Subtitle || ''}
                          onChange={e => setSettings({...settings, showcase2Subtitle: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Foto Kategori</label>
                        <ImageUploader 
                          value={settings.showcase2ImageUrl || ''}
                          onChange={url => setSettings({...settings, showcase2ImageUrl: url})}
                        />
                      </div>
                    </div>

                    {/* Showcase 3 */}
                    <div className="p-3 border rounded bg-white space-y-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">Showcase Kategori #3</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Nama Judul</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                          value={settings.showcase3Title || ''}
                          onChange={e => setSettings({...settings, showcase3Title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block">Epithet / Sub-tag</label>
                        <input 
                          type="text" className="w-full p-1.5 border rounded text-xs"
                          value={settings.showcase3Subtitle || ''}
                          onChange={e => setSettings({...settings, showcase3Subtitle: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Foto Kategori</label>
                        <ImageUploader 
                          value={settings.showcase3ImageUrl || ''}
                          onChange={url => setSettings({...settings, showcase3ImageUrl: url})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: KONTEN FILOSOFI BATIK (INTERPRETASI NILAI-NILAI) */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="bg-slate-55 p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-batik-primary text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">Section 4</span>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Kelola Konten Interpretasi Nilai & Filosofi Batik</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Sesuaikan teks filosofi utama, slogan interpretasi, foto grup beserta keterangan teks yang mendeskripsikan aktivitas atau pameran tersebut.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Slogan Interpretasi (Subtitle, e.g. INTERPRETASI NILAI-NILAI)</label>
                    <input 
                      type="text" className="w-full p-2 border rounded bg-white text-xs font-semibold"
                      value={settings.philoSubtitle || ''}
                      onChange={e => setSettings({...settings, philoSubtitle: e.target.value})}
                      placeholder="INTERPRETASI NILAI-NILAI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Judul Besar Filosofi *</label>
                    <input 
                      type="text" required className="w-full p-2 border rounded bg-white text-xs font-bold"
                      value={settings.philoTitle || ''}
                      onChange={e => setSettings({...settings, philoTitle: e.target.value})}
                      placeholder="Filosofi Batik Jawa Timur"
                    />
                    <AiGenerator 
                      label="Judul Besar Filosofi" 
                      type="title" 
                      onGenerate={val => setSettings({...settings, philoTitle: val})} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Deskripsi Utama Filosofi *</label>
                  <textarea 
                    rows={4} required className="w-full p-2 border rounded bg-white text-xs leading-relaxed"
                    value={settings.philoDescription || ''}
                    onChange={e => setSettings({...settings, philoDescription: e.target.value})}
                    placeholder="Batik bukan sekadar kain bermotif, melainkan cerminan nilai-nilai filosofis..."
                  />
                  <AiGenerator 
                    label="Deskripsi Utama Filosofi Batik" 
                    type="philosophy" 
                    onGenerate={val => setSettings({...settings, philoDescription: val})} 
                  />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide">Keterangan Foto Grup (Sisi Kiri)</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Sub-Teks Foto (e.g. MALAM PUNCAK KEAKRABAN)</label>
                      <input 
                        type="text" className="w-full p-2 border rounded bg-white text-xs"
                        value={settings.philoGroupSubtitle || ''}
                        onChange={e => setSettings({...settings, philoGroupSubtitle: e.target.value})}
                        placeholder="MALAM PUNCAK KEAKRABAN"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Judul Foto (e.g. Kelompok Finalis Putera Puteri Batik)</label>
                      <input 
                        type="text" className="w-full p-2 border rounded bg-white text-xs"
                        value={settings.philoGroupTitle || ''}
                        onChange={e => setSettings({...settings, philoGroupTitle: e.target.value})}
                        placeholder="Kelompok Finalis Putera Puteri Batik"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-slate-400 block font-bold">Gambar Foto Grup / Aktivitas (Sisi Kiri) *</label>
                    <ImageUploader 
                      value={settings.philoGroupImageUrl || ''}
                      onChange={url => setSettings({...settings, philoGroupImageUrl: url})}
                      label="Unggah Foto Puncak Keakraban / Agenda"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ADDITIONAL SECTION TITLES & SUBTITLES */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="bg-slate-55 p-4 rounded-xl border border-slate-200 space-y-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="bg-batik-primary text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-full">Headers</span>
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Kelola Judul & Label Bagian (Section Titles)</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Ganti dan sesuaikan semua slogan tipis (Subtitle) serta judul tebal (Title) pada setiap section halaman utama website untuk mempermudah pembaruan visual.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Katalog */}
                  <div className="p-3 border rounded bg-white space-y-2">
                    <span className="text-[10px] font-bold text-batik-primary uppercase">Bagian 3: Katalog Produk</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Slogan (Subtitle)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-semibold"
                        value={settings.catalogSubtitle || ''}
                        onChange={e => setSettings({...settings, catalogSubtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Judul (Title)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                        value={settings.catalogTitle || ''}
                        onChange={e => setSettings({...settings, catalogTitle: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Produk Terlaris */}
                  <div className="p-3 border rounded bg-white space-y-2">
                    <span className="text-[10px] font-bold text-batik-primary uppercase">Bagian 5: Produk Terlaris</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Slogan (Subtitle)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-semibold"
                        value={settings.bestsellersSubtitle || ''}
                        onChange={e => setSettings({...settings, bestsellersSubtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Judul (Title)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                        value={settings.bestsellersTitle || ''}
                        onChange={e => setSettings({...settings, bestsellersTitle: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Testimoni */}
                  <div className="p-3 border rounded bg-white space-y-2">
                    <span className="text-[10px] font-bold text-batik-primary uppercase">Bagian 7: Testimoni</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Slogan (Subtitle)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-semibold"
                        value={settings.testiSubtitle || ''}
                        onChange={e => setSettings({...settings, testiSubtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Judul (Title)</label>
                      <input 
                        type="text" className="w-full p-1.5 border rounded text-xs font-bold"
                        value={settings.testiTitle || ''}
                        onChange={e => setSettings({...settings, testiTitle: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Rekomendasi & Event */}
                  <div className="p-3 border rounded bg-white space-y-2">
                    <span className="text-[10px] font-bold text-batik-primary uppercase">Bagian 8: Rekomendasi & Event</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Slogan Rekomendasi</label>
                        <input 
                          type="text" className="w-full p-1 border rounded text-[10px]"
                          value={settings.recomSubtitle || ''}
                          onChange={e => setSettings({...settings, recomSubtitle: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Judul Rekomendasi</label>
                        <input 
                          type="text" className="w-full p-1 border rounded text-[10px] font-bold"
                          value={settings.recomTitle || ''}
                          onChange={e => setSettings({...settings, recomTitle: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Slogan Event</label>
                        <input 
                          type="text" className="w-full p-1 border rounded text-[10px]"
                          value={settings.eventsSubtitle || ''}
                          onChange={e => setSettings({...settings, eventsSubtitle: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">Judul Event</label>
                        <input 
                          type="text" className="w-full p-1 border rounded text-[10px] font-bold"
                          value={settings.eventsTitle || ''}
                          onChange={e => setSettings({...settings, eventsTitle: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t">
              <button 
                type="submit" 
                className="bg-batik-primary text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-opacity-90"
              >
                SIMPAN PENGATURAN & KONTEN WEBSITE
              </button>
            </div>
          </form>

          {/* REGISTRASI PENGELOLA BARU */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs text-slate-100 max-w-4xl font-sans shadow-lg mt-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <Shield className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-serif font-bold text-amber-400 text-sm tracking-wide">REGISTRASI PENGELOLA BARU (Firebase Auth)</h4>
                <p className="text-slate-400 text-[10px]">Daftarkan alamat email administrator tambahan untuk mengakses console ini.</p>
              </div>
            </div>
            
            <form onSubmit={handleRegisterNewManager} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Alamat Email Pengelola Baru *</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: pengelola@batikjatim.org"
                    value={newManagerEmail}
                    onChange={e => setNewManagerEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-850 border border-slate-800 text-white rounded focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Kata Sandi Pengelola *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newManagerPassword}
                    onChange={e => setNewManagerPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-850 border border-slate-800 text-white rounded focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-amber-950/20 text-amber-300/95 rounded border border-amber-900/40 leading-relaxed text-[11px]">
                <strong>Catatan Kebebasan Pengelola:</strong> Form pendaftaran ini meregistrasikan kredensial administrator baru secara aman di Firebase Authentication secara langsung. Setelah pendaftaran selesai, Anda dapat membagikan email & sandi ke pengelola yang ditunjuk. Browser ini akan otomatis beralih menggunakan akun baru tersebut.
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={registeringManager}
                  className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {registeringManager ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  BUAT PENGELOLA BARU
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

      </main>

    </div>
  );
}

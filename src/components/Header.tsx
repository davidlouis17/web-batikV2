/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Shield, ShoppingBag, Calendar, Info, Heart, Mail } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  siteTitle: string;
  onTrackPageView?: (path: string, title: string) => void;
}

export default function Header({ isAdmin, setIsAdmin, siteTitle, onTrackPageView }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'BERANDA', href: '#beranda', icon: Heart },
    { label: 'SEJARAH BATIK', href: '#sejarah', icon: Info },
    { label: 'FILOSOFI BATIK', href: '#filosofi', icon: Heart },
    { label: 'KATALOG BATIK', href: '#katalog', icon: ShoppingBag },
    { label: 'EVENT', href: '#event', icon: Calendar },
    { label: 'KONTAK', href: '#kontak', icon: Mail },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (isAdmin) {
      setIsAdmin(false);
    }
    
    // Dynamically track path and view
    if (onTrackPageView) {
      const labels: { [key: string]: string } = {
        '#beranda': 'Beranda Profil',
        '#sejarah': 'Sejarah Batik Jatim',
        '#filosofi': 'Filosofi Batik',
        '#katalog': 'Katalog Batik & Produk',
        '#event': 'Event & Dokumentasi',
        '#kontak': 'Pusat Informasi & Kontak'
      };
      onTrackPageView(href, labels[href] || href);
    }

    // Smooth scroll to the target
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDE9ED] border-b border-[#8B0022]/15 backdrop-blur-md bg-opacity-95 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex-1 flex flex-col justify-center">
            <a 
              href="#beranda" 
              onClick={() => handleLinkClick('#beranda')}
              className="text-[#8B0022] hover:text-[#C92C53] transition"
              id="header-brand-logo"
            >
              <h1 className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-[0.1em] leading-tight uppercase">
                {siteTitle}
              </h1>
              <p className="font-sans text-[10px] tracking-[0.2em] text-[#C92C53] font-bold mt-0.5">
                ASOSIASI BATIK PROVINSI JAWA TIMUR
              </p>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }}
                className="font-sans text-xs font-bold tracking-widest text-[#1A1A1A] hover:text-[#8B0022] transition-colors duration-200 border-b-2 border-transparent hover:border-[#8B0022] pb-1 uppercase"
                id={`nav-link-${item.href.replace('#', '')}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded text-[#8B0022] hover:text-[#C92C53]"
              aria-expanded="false"
              id="mobile-menu-btn"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#FDE9ED] border-b border-[#8B0022]/15 px-4 pt-2 pb-6 space-y-2 shadow-inner transition-transform animate-fade-in" id="mobile-menu-panel">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold tracking-wider text-slate-800 hover:bg-white hover:text-[#8B0022] transition uppercase"
              >
                <IconComponent className="w-4 h-4 text-[#C92C53]" />
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}

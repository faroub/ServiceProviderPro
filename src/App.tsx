import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench, Zap, Sparkles, Hammer, Paintbrush, Trees, Laptop,
  Briefcase, GraduationCap, Camera, Truck, Star, MapPin,
  CheckCircle2, AlertCircle, Clock, Calendar, MessageSquare,
  Shield, DollarSign, Search, Filter, X, ChevronRight,
  User, Settings, ArrowLeft, Send, Phone, ThumbsUp, Plus,
  ExternalLink, HelpCircle, FileText, Globe, Check, AlertTriangle
} from 'lucide-react';

import {
  WILAYAS, CATEGORIES, INITIAL_PROVIDERS, INITIAL_REVIEWS,
  INITIAL_BOOKINGS, INITIAL_MESSAGES, INITIAL_REPORTS,
  Provider, Booking, Review, ChatMessage, ReportItem
} from './data/mockData';
import { TRANSLATIONS, Language } from './i18n';
import { LazyPortfolioImage } from './components/LazyPortfolioImage';
import { PortfolioLightbox } from './components/PortfolioLightbox';

export default function App() {
  // Localization
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  // Set html dir attribute on language change
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  // Active View / Page: 'marketplace' | 'bookings' | 'messages' | 'providerDash' | 'adminHub' | 'howItWorks' | 'forProviders' | 'contact'
  const [activeTab, setActiveTab] = useState<'marketplace' | 'bookings' | 'messages' | 'providerDash' | 'adminHub' | 'howItWorks' | 'forProviders' | 'contact'>('marketplace');

  // User State & Roles: 'client' | 'provider' | 'admin'
  const [currentUserRole, setCurrentUserRole] = useState<'client' | 'provider' | 'admin'>('client');
  const [userName, setUserName] = useState<string>('Youcef Taleb');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Persistent State (with localStorage backup)
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('kp_providers');
    return saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kp_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kp_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kp_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('kp_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kp_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('kp_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kp_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kp_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('kp_reports', JSON.stringify(reports));
  }, [reports]);

  // Marketplace Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');

  // Modals & Selections
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadAllTrigger, setLoadAllTrigger] = useState<number>(0);
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kp_data_saver');
      if (saved !== null) return saved === 'true';
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        return !!(conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === '3g');
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [activeChatThread, setActiveChatThread] = useState<string>('p1');
  const [newMsgText, setNewMsgText] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTimeSlot, setBookingTimeSlot] = useState('09:00 - 11:00');
  const [bookingType, setBookingType] = useState<'hourly' | 'quote'>('hourly');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [bookingToast, setBookingToast] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Provider Schedule State
  const [providerSchedule, setProviderSchedule] = useState({
    mon: true, tue: true, wed: true, thu: true, fri: false, sat: true, sun: false
  });

  // Auth Modal State
  const [authPhone, setAuthPhone] = useState('0550123456');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [authOtp, setAuthOtp] = useState('123456');
  const [authNameInput, setAuthNameInput] = useState('Youcef Taleb');
  const [authSelectedRole, setAuthSelectedRole] = useState<'client' | 'provider'>('client');

  // Contact Form State
  const [contactSuccess, setContactSuccess] = useState(false);

  // Filtered Providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (!p.active) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedWilaya && p.wilayaCode !== selectedWilaya && !p.crossWilaya) return false;
      if (verifiedOnly && !p.verified) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesCity = p.city.toLowerCase().includes(q);
        const matchesBaladiya = p.baladiya.toLowerCase().includes(q);
        const categoryObj = CATEGORIES.find(c => c.id === p.category);
        const matchesCat = categoryObj && (
          categoryObj.nameEn.toLowerCase().includes(q) ||
          categoryObj.nameFr.toLowerCase().includes(q) ||
          categoryObj.nameAr.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesBio && !matchesCity && !matchesBaladiya && !matchesCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price_desc') return b.hourlyRate - a.hourlyRate;
      return 0;
    });
  }, [providers, selectedCategory, selectedWilaya, verifiedOnly, searchQuery, sortBy]);

  // Handle New Booking Submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProvider) return;

    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      providerId: bookingProvider.id,
      providerName: bookingProvider.fullName,
      providerCategory: CATEGORIES.find(c => c.id === bookingProvider.category)?.nameEn || bookingProvider.category,
      clientId: 'c_guest',
      clientName: userName,
      clientPhone: '+213550123456',
      bookingType,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      address: bookingAddress || `${bookingProvider.baladiya}, ${bookingProvider.city}`,
      wilayaCode: bookingProvider.wilayaCode,
      baladiya: bookingProvider.baladiya,
      description: bookingDescription || 'Standard service request',
      status: 'pending',
      priceEstimate: bookingType === 'hourly' ? bookingProvider.hourlyRate * 2 : bookingProvider.taskRate,
      createdAt: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    setBookingProvider(null);
    setBookingToast(true);
    setTimeout(() => setBookingToast(false), 5000);
    setActiveTab('bookings');
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;

    const newRev: Review = {
      id: `r_${Date.now()}`,
      bookingId: reviewingBooking.id,
      providerId: reviewingBooking.providerId,
      clientName: userName,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);

    // Update provider's score and review count
    const provReviews = updatedReviews.filter(r => r.providerId === reviewingBooking.providerId);
    const avgRating = provReviews.reduce((sum, r) => sum + r.rating, 0) / provReviews.length;

    setProviders(prev => prev.map(p => {
      if (p.id === reviewingBooking.providerId) {
        return {
          ...p,
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: provReviews.length
        };
      }
      return p;
    }));

    setReviewingBooking(null);
    setReviewComment('');
  };

  // Handle Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      threadId: activeChatThread,
      senderId: currentUserRole === 'provider' ? activeChatThread : 'c_guest',
      senderName: currentUserRole === 'provider' ? 'Provider' : userName,
      text: newMsgText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMsgText('');
  };

  // Category Icon Renderer
  const renderCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Wrench': return <Wrench className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Hammer': return <Hammer className={className} />;
      case 'Paintbrush': return <Paintbrush className={className} />;
      case 'Trees': return <Trees className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Camera': return <Camera className={className} />;
      case 'Truck': return <Truck className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  // Current Wilaya Name helper
  const getWilayaName = (code: string) => {
    const w = WILAYAS.find(item => item.code === code);
    if (!w) return code;
    if (lang === 'ar') return w.ar;
    if (lang === 'fr') return w.fr;
    return w.en;
  };

  return (
    <div className={`min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Top Banner Alert */}
      {bookingToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{t.bookingModal.successMsg}</span>
          <button onClick={() => setBookingToast(false)} className="ml-4 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                k
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  khedma<span className="text-amber-400">Pro</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  DZ
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.nav.browse}
              </button>
              <button
                onClick={() => setActiveTab('howItWorks')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'howItWorks'
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.nav.howItWorks}
              </button>
              <button
                onClick={() => setActiveTab('forProviders')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'forProviders'
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.nav.forProviders}
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {t.nav.contact}
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Bookings shortcut */}
            <button
              onClick={() => setActiveTab('bookings')}
              className={`p-2 rounded-lg relative transition-colors ${
                activeTab === 'bookings' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={t.nav.bookings}
            >
              <Calendar className="w-5 h-5" />
              {bookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {bookings.length}
                </span>
              )}
            </button>

            {/* Chat shortcut */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`p-2 rounded-lg relative transition-colors ${
                activeTab === 'messages' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={t.nav.messages}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                1
              </span>
            </button>

            {/* Quick Role Switcher (Client / Provider / Admin) */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => {
                  setCurrentUserRole('client');
                  if (activeTab === 'providerDash' || activeTab === 'adminHub') setActiveTab('marketplace');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentUserRole === 'client' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => {
                  setCurrentUserRole('provider');
                  setActiveTab('providerDash');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentUserRole === 'provider' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.nav.providerDashboard}
              </button>
              <button
                onClick={() => {
                  setCurrentUserRole('admin');
                  setActiveTab('adminHub');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentUserRole === 'admin' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.nav.adminHub}
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
              >
                <option value="en" className="bg-slate-900 text-white">EN</option>
                <option value="fr" className="bg-slate-900 text-white">FR</option>
                <option value="ar" className="bg-slate-900 text-white">العربية</option>
              </select>
            </div>

            {/* User Profile / Sign In */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{userName.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/90 py-2 px-2 text-xs">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'marketplace' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Search className="w-4 h-4" />
            <span>{t.nav.browse}</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'bookings' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.nav.bookings}</span>
          </button>
          <button
            onClick={() => {
              setCurrentUserRole('provider');
              setActiveTab('providerDash');
            }}
            className={`flex flex-col items-center gap-1 ${activeTab === 'providerDash' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t.nav.providerDashboard}</span>
          </button>
          <button
            onClick={() => {
              setCurrentUserRole('admin');
              setActiveTab('adminHub');
            }}
            className={`flex flex-col items-center gap-1 ${activeTab === 'adminHub' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            <Shield className="w-4 h-4" />
            <span>{t.nav.adminHub}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEW ROUTING */}
      <main className="flex-1">

        {/* VIEW 1: MARKETPLACE BROWSER */}
        {activeTab === 'marketplace' && (
          <div className="pb-16">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0B1120] border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <span>{t.algeriaBadge}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {t.hero.title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">{t.hero.title2}</span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  {t.hero.subtitle}
                </p>

                {/* Primary Search & Wilaya Bar */}
                <div className="pt-4 max-w-3xl mx-auto">
                  <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2 shadow-2xl">
                    <div className="flex items-center gap-2 flex-1 px-3 w-full">
                      <Search className="w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t.hero.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white placeholder-slate-500 w-full text-sm outline-none py-1.5"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

                    {/* 58 Wilayas Selector */}
                    <div className="flex items-center gap-2 w-full sm:w-60 px-3 bg-slate-900/60 rounded-xl py-1.5 border border-slate-800">
                      <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <select
                        value={selectedWilaya}
                        onChange={(e) => setSelectedWilaya(e.target.value)}
                        className="bg-transparent text-slate-200 text-xs sm:text-sm w-full outline-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-300">{t.hero.wilayaSelect}</option>
                        {WILAYAS.map(w => (
                          <option key={w.code} value={w.code} className="bg-slate-900 text-white">
                            {w.code} - {lang === 'ar' ? w.ar : lang === 'fr' ? w.fr : w.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {}}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>{t.hero.searchBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Trust stats */}
                <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto pt-6 text-center">
                  <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-2.5">
                    <div className="text-xl sm:text-2xl font-black text-amber-400">58</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{t.hero.statWilayas}</div>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-2.5">
                    <div className="text-xl sm:text-2xl font-black text-amber-400">100%</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{t.hero.statVerified}</div>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-2.5">
                    <div className="text-xl sm:text-2xl font-black text-amber-400">90</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{t.hero.statTrial}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Carousel Chips */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {t.filters.allCategories}
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    {t.filters.reset}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                    selectedCategory === null
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.filters.allCategories}</span>
                </button>
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  const name = lang === 'ar' ? cat.nameAr : lang === 'fr' ? cat.nameFr : cat.nameEn;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {renderCategoryIcon(cat.icon, "w-4 h-4")}
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                <span className="font-bold text-white">{filteredProviders.length}</span> {t.filters.foundCount}
                {selectedWilaya && (
                  <span className="ml-1 text-amber-400 font-semibold">({getWilayaName(selectedWilaya)})</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Verified Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span>{t.filters.verifiedOnly}</span>
                </label>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
                  >
                    <option value="rating" className="bg-slate-900">{t.filters.sortRating}</option>
                    <option value="price_asc" className="bg-slate-900">{t.filters.sortPriceAsc}</option>
                    <option value="price_desc" className="bg-slate-900">{t.filters.sortPriceDesc}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Providers Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              {filteredProviders.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 p-8">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-lg font-bold text-white mb-1">No professionals match your filters</h4>
                  <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
                    Try selecting "All 58 Wilayas" or resetting the category filter to view providers across Algeria.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedWilaya('');
                      setVerifiedOnly(false);
                      setSearchQuery('');
                    }}
                    className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-400"
                  >
                    {t.filters.reset}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProviders.map(p => {
                    const catObj = CATEGORIES.find(c => c.id === p.category);
                    const catName = catObj ? (lang === 'ar' ? catObj.nameAr : lang === 'fr' ? catObj.nameFr : catObj.nameEn) : p.category;
                    const wilayaName = getWilayaName(p.wilayaCode);

                    return (
                      <div
                        key={p.id}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
                      >
                        <div>
                          {/* Top row: Avatar + Name + Rating */}
                          <div className="flex items-start gap-3.5 mb-3.5">
                            <div className="relative flex-shrink-0">
                              <img
                                src={p.avatarUrl}
                                alt={p.fullName}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-colors"
                              />
                              {p.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title={t.card.verified}>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-white text-base truncate group-hover:text-amber-400 transition-colors">
                                  {p.fullName}
                                </h4>
                              </div>
                              <div className="text-xs font-semibold text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                                {catObj && renderCategoryIcon(catObj.icon, "w-3.5 h-3.5")}
                                <span>{catName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span className="truncate">{p.baladiya}, {wilayaName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
                            {p.bio}
                          </p>

                          {/* Ratings & Service Coverage */}
                          <div className="flex items-center justify-between bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/80 text-xs mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-bold text-white">{p.rating}</span>
                              <span className="text-slate-500">({p.reviewsCount} {t.card.reviews})</span>
                            </div>
                            {p.crossWilaya ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {t.card.crossWilaya}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {p.city}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Pricing & Actions */}
                        <div>
                          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80 mb-3">
                            <span className="text-[11px] text-slate-400">{t.card.startingFrom}</span>
                            <div className="text-right">
                              <span className="text-base font-black text-amber-400">{p.hourlyRate} {t.currency}</span>
                              <span className="text-[11px] text-slate-400">{t.card.hourly}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedProvider(p)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-700 transition-colors text-center"
                            >
                              {t.card.viewProfile}
                            </button>
                            <button
                              onClick={() => setBookingProvider(p)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-colors text-center shadow-sm"
                            >
                              {t.card.bookNow}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CLIENT BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{t.bookingsTab.title}</h2>
                <p className="text-slate-400 text-sm">{t.bookingsTab.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-400"
              >
                + Find Another Pro
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-4">{t.bookingsTab.empty}</p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  {t.hero.searchBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => {
                  const statusColors = {
                    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                    confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30'
                  }[b.status];

                  return (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{b.providerName}</h4>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-amber-400 font-semibold">{b.providerCategory}</div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {b.date} ({b.timeSlot})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {b.address}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 italic pt-1">"{b.description}"</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Est. Total</div>
                          <div className="text-base font-black text-amber-400">{b.priceEstimate} {t.currency}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.status === 'completed' && (
                            <button
                              onClick={() => setReviewingBooking(b)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5" />
                              {t.bookingsTab.leaveReview}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveChatThread(b.providerId);
                              setActiveTab('messages');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            {t.bookingsTab.chatWithPro}
                          </button>
                          {b.status === 'pending' && (
                            <button
                              onClick={() => {
                                setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'cancelled' } : item));
                              }}
                              className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1"
                            >
                              {t.bookingsTab.cancelBooking}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: IN-APP CHAT VIEW */}
        {activeTab === 'messages' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-white">{t.chat.title}</h2>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mt-2 text-xs text-amber-300/90 flex items-center gap-2">
                <span>{t.chat.safetyNotice}</span>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row">
              {/* Thread list sidebar */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 space-y-1">
                {providers.slice(0, 4).map(p => {
                  const isSelected = activeChatThread === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveChatThread(p.id)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-amber-500/15 border border-amber-500/30' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <img src={p.avatarUrl} alt={p.fullName} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{p.fullName}</div>
                        <div className="text-xs text-amber-400/90 truncate">{CATEGORIES.find(c => c.id === p.category)?.nameEn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Chat Thread Messages & Input */}
              <div className="flex-1 flex flex-col justify-between bg-slate-900/60">
                {/* Message list */}
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {messages
                    .filter(m => m.threadId === activeChatThread)
                    .map(m => {
                      const isMe = m.senderId === 'c_guest' || (currentUserRole === 'provider' && m.senderId === activeChatThread);
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-slate-500 mb-1 px-1">{m.senderName} • {m.timestamp}</div>
                          <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md'
                              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Send input */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t.chat.typePlaceholder}
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.chat.send}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: PROVIDER PORTAL DASHBOARD */}
        {activeTab === 'providerDash' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{t.providerDash.title}</h2>
                <p className="text-slate-400 text-sm">{t.providerDash.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Service Provider</span>
              </div>
            </div>

            {/* Trial Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-amber-400">{t.providerDash.trialBannerTitle}</span>
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    74 {t.providerDash.trialDaysRemaining}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                  {t.providerDash.trialBannerDesc}
                </p>
              </div>
              <button
                onClick={() => alert("Simulation: 1,000 DZD subscription paid via BaridiMob / Edahabia. Active for 30 more days!")}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-colors whitespace-nowrap"
              >
                {t.providerDash.payBtn}
              </button>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-slate-400 text-xs font-medium">{t.providerDash.monthlyEarnings}</div>
                <div className="text-2xl font-black text-amber-400 mt-1">24,500 {t.currency}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">↑ +18% this month</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-slate-400 text-xs font-medium">{t.providerDash.completedJobs}</div>
                <div className="text-2xl font-black text-white mt-1">16</div>
                <div className="text-[11px] text-slate-500 mt-1">100% completion rate</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-slate-400 text-xs font-medium">{t.providerDash.upcomingJobs}</div>
                <div className="text-2xl font-black text-white mt-1">{bookings.filter(b => b.status === 'confirmed').length}</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-1">Next: Saturday</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-slate-400 text-xs font-medium">{t.providerDash.ratingScore}</div>
                <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span>4.9</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Based on 38 reviews</div>
              </div>
            </div>

            {/* Incoming Requests & Appointments */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">{t.providerDash.incomingRequests}</h3>
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{b.clientName}</span>
                        <span className="text-xs text-slate-400">({b.clientPhone})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        📅 {b.date} ({b.timeSlot}) • 📍 {b.address}
                      </div>
                      <p className="text-xs text-slate-300 italic mt-1">"{b.description}"</p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'confirmed' } : item))}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                          >
                            {t.providerDash.accept}
                          </button>
                          <button
                            onClick={() => setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'cancelled' } : item))}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-xs px-3 py-1.5 rounded-lg border border-red-500/30"
                          >
                            {t.providerDash.decline}
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'completed' } : item))}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg"
                        >
                          {t.providerDash.markCompleted}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">{t.providerDash.scheduleTitle}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {Object.entries(providerSchedule).map(([day, active]) => (
                  <button
                    key={day}
                    onClick={() => setProviderSchedule(prev => ({ ...prev, [day]: !active }))}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-xs uppercase font-bold">{day}</div>
                    <div className="text-[11px] font-semibold mt-1">
                      {active ? '08:00 - 17:00' : 'Off'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ADMIN MANAGEMENT HUB */}
        {activeTab === 'adminHub' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{t.admin.title}</h2>
                <p className="text-slate-400 text-sm">{t.admin.subtitle}</p>
              </div>
              <div className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">
                Admin Mode: admin@khedmapro.dz
              </div>
            </div>

            {/* Admin KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiUsers}</div>
                <div className="text-xl font-black text-white mt-0.5">1,420</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiPros}</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">{providers.filter(p => p.verified).length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiBookings}</div>
                <div className="text-xl font-black text-white mt-0.5">{bookings.length + 84}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiGmv}</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">380k {t.currency}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiCommission}</div>
                <div className="text-lg font-black text-amber-400 mt-0.5">42,000 {t.currency}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <div className="text-slate-400 text-[11px]">{t.admin.kpiFlags}</div>
                <div className="text-xl font-black text-red-400 mt-0.5">{reports.filter(r => r.status === 'open').length}</div>
              </div>
            </div>

            {/* Provider Verification Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>{t.admin.tabVerification}</span>
                <span className="text-xs text-amber-400 font-semibold">
                  {providers.filter(p => p.verificationStatus === 'pending').length} pending applications
                </span>
              </h3>
              <div className="space-y-3">
                {providers.filter(p => p.verificationStatus === 'pending').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">All provider identity verification queues are currently cleared!</p>
                ) : (
                  providers.filter(p => p.verificationStatus === 'pending').map(p => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={p.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-white text-sm">{p.fullName}</div>
                          <div className="text-xs text-slate-400">{CATEGORIES.find(c => c.id === p.category)?.nameEn} • {p.city} ({p.wilayaCode})</div>
                          <div className="text-[11px] text-amber-400 mt-0.5">National Biometric ID + Trade Registration submitted</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProviders(prev => prev.map(item => item.id === p.id ? { ...item, verified: true, verificationStatus: 'verified' } : item));
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                        >
                          {t.admin.approve}
                        </button>
                        <button
                          onClick={() => {
                            setProviders(prev => prev.map(item => item.id === p.id ? { ...item, verified: false, verificationStatus: 'rejected' } : item));
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl border border-red-500/30"
                        >
                          {t.admin.reject}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Moderation Reports Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">{t.admin.tabReports}</h3>
              <div className="space-y-3">
                {reports.map(rep => (
                  <div key={rep.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rep.providerName}</span>
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-bold">{rep.reason}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{rep.details}</p>
                    </div>

                    {rep.status === 'open' ? (
                      <button
                        onClick={() => {
                          setReports(prev => prev.map(r => r.id === rep.id ? { ...r, status: 'resolved' } : r));
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap"
                      >
                        {t.admin.resolve}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold">Resolved</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: HOW IT WORKS */}
        {activeTab === 'howItWorks' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white">{t.howItWorksPage.title}</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">{t.howItWorksPage.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 font-black text-xl flex items-center justify-center mx-auto">
                  1
                </div>
                <h4 className="text-lg font-bold text-white">{t.howItWorksPage.step1Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{t.howItWorksPage.step1Desc}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 font-black text-xl flex items-center justify-center mx-auto">
                  2
                </div>
                <h4 className="text-lg font-bold text-white">{t.howItWorksPage.step2Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{t.howItWorksPage.step2Desc}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 font-black text-xl flex items-center justify-center mx-auto">
                  3
                </div>
                <h4 className="text-lg font-bold text-white">{t.howItWorksPage.step3Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{t.howItWorksPage.step3Desc}</p>
              </div>
            </div>

            <div className="text-center pt-8">
              <button
                onClick={() => setActiveTab('marketplace')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl text-sm shadow-md"
              >
                {t.hero.searchBtn} →
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: FOR PROVIDERS */}
        {activeTab === 'forProviders' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white">{t.forProvidersPage.title}</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">{t.forProvidersPage.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">{t.forProvidersPage.benefit1Title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm">{t.forProvidersPage.benefit1Desc}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">{t.forProvidersPage.benefit2Title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm">{t.forProvidersPage.benefit2Desc}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">{t.forProvidersPage.benefit3Title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm">{t.forProvidersPage.benefit3Desc}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-2xl font-black text-white">Ready to receive client requests?</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Join hundreds of vetted plumbers, electricians, cleaners and contractors across all 58 Algerian wilayas.
              </p>
              <button
                onClick={() => {
                  setCurrentUserRole('provider');
                  setActiveTab('providerDash');
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl text-sm shadow-md"
              >
                {t.forProvidersPage.joinCta}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 8: CONTACT & SUPPORT */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white">{t.contactPage.title}</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">{t.contactPage.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Direct channels */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h4 className="font-bold text-white text-lg">Direct Contacts</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>{t.contactPage.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{t.contactPage.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span>{t.contactPage.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>{t.contactPage.address}</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                {contactSuccess ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <p className="text-white font-bold text-sm">{t.contactPage.formSuccess}</p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="text-xs text-amber-400 underline font-semibold"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSuccess(true); }} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">{t.contactPage.formName}</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">{t.contactPage.formEmail}</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">{t.contactPage.formMessage}</label>
                      <textarea
                        required
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {t.contactPage.formSubmit}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PROVIDER DETAIL MODAL */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Provider header info */}
            <div className="flex items-start gap-4">
              <img src={selectedProvider.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedProvider.fullName}</h3>
                  {selectedProvider.verified && (
                    <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="text-amber-400 font-semibold text-sm mt-0.5">
                  {CATEGORIES.find(c => c.id === selectedProvider.category)?.nameEn}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedProvider.baladiya}, {getWilayaName(selectedProvider.wilayaCode)}</span>
                  {selectedProvider.crossWilaya && (
                    <span className="text-emerald-400 ml-2">• Covers neighbouring wilayas</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-1.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{selectedProvider.rating}</span>
                  <span className="text-slate-500">({selectedProvider.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.profileModal.about}</h5>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {selectedProvider.bio}
              </p>
            </div>

            {/* Standard Pricing Breakdown */}
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.profileModal.pricing}</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">{t.profileModal.hourlyRate}</div>
                  <div className="text-lg font-black text-amber-400 mt-1">{selectedProvider.hourlyRate} {t.currency}/hr</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">{t.profileModal.fixedTaskRate}</div>
                  <div className="text-lg font-black text-amber-400 mt-1">{selectedProvider.taskRate} {t.currency}/task</div>
                </div>
              </div>
            </div>

            {/* Portfolio Photos with Lazy Loading & Mobile Data Saver */}
            {selectedProvider.portfolio && selectedProvider.portfolio.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t.profileModal.portfolio}
                    </h5>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                      {selectedProvider.portfolio.length} {t.profileModal.photosCount || 'photos'}
                    </span>
                  </div>

                  {/* Mobile Data Saver Controls */}
                  <div className="flex items-center gap-2">
                    {dataSaverMode && (
                      <button
                        id="load-all-portfolio-btn"
                        type="button"
                        onClick={() => {
                          setDataSaverMode(false);
                          setLoadAllTrigger((prev) => prev + 1);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                      >
                        {t.profileModal.loadAllPhotos || 'Load all'}
                      </button>
                    )}
                    <button
                      id="toggle-data-saver-btn"
                      type="button"
                      onClick={() => {
                        const next = !dataSaverMode;
                        setDataSaverMode(next);
                        try {
                          localStorage.setItem('kp_data_saver', String(next));
                        } catch {}
                      }}
                      title={t.profileModal.dataSaverTip}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
                        dataSaverMode
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dataSaverMode ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{dataSaverMode ? t.profileModal.dataSaverOn : t.profileModal.dataSaverOff}</span>
                    </button>
                  </div>
                </div>

                {dataSaverMode && (
                  <p className="text-[11px] text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{t.profileModal.dataSaverTip}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {selectedProvider.portfolio.map((img, idx) => (
                    <LazyPortfolioImage
                      key={`${selectedProvider.id}-portfolio-${idx}-${loadAllTrigger}`}
                      src={img}
                      alt={`${selectedProvider.fullName} past project ${idx + 1}`}
                      index={idx}
                      totalCount={selectedProvider.portfolio!.length}
                      dataSaverMode={dataSaverMode}
                      onOpenLightbox={(i) => setLightboxIndex(i)}
                      lang={lang}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Client Reviews Section */}
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.profileModal.reviews}</h5>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {reviews.filter(r => r.providerId === selectedProvider.id).length === 0 ? (
                  <p className="text-xs text-slate-500">{t.profileModal.noReviews}</p>
                ) : (
                  reviews.filter(r => r.providerId === selectedProvider.id).map(r => (
                    <div key={r.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{r.clientName}</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-slate-300">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveChatThread(selectedProvider.id);
                  setSelectedProvider(null);
                  setActiveTab('messages');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-sm border border-slate-700 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>{t.card.message}</span>
              </button>
              <button
                onClick={() => {
                  setBookingProvider(selectedProvider);
                  setSelectedProvider(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.card.bookNow}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO FULLSCREEN LIGHTBOX VIEWER */}
      {selectedProvider && lightboxIndex !== null && selectedProvider.portfolio && selectedProvider.portfolio.length > 0 && (
        <PortfolioLightbox
          images={selectedProvider.portfolio}
          currentIndex={lightboxIndex}
          providerName={selectedProvider.fullName}
          onClose={() => setLightboxIndex(null)}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* BOOKING MODAL */}
      {bookingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => setBookingProvider(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">
                {t.bookingModal.title} <span className="text-amber-400">{bookingProvider.fullName}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {CATEGORIES.find(c => c.id === bookingProvider.category)?.nameEn} • {bookingProvider.baladiya}, {getWilayaName(bookingProvider.wilayaCode)}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              {/* Service Type Switch */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">{t.bookingModal.serviceType}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('hourly')}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      bookingType === 'hourly'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    Hourly ({bookingProvider.hourlyRate} {t.currency}/hr)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('quote')}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      bookingType === 'quote'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    Custom Quote ({bookingProvider.taskRate} {t.currency})
                  </button>
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">{t.bookingModal.dateLabel}</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Time slot chips */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">{t.bookingModal.timeLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00 - 11:00', '13:00 - 15:00', '16:00 - 18:00'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTimeSlot(slot)}
                      className={`p-2 rounded-xl border text-center ${
                        bookingTimeSlot === slot
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">{t.bookingModal.addressLabel}</label>
                <input
                  type="text"
                  placeholder={t.bookingModal.addressPlaceholder}
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">{t.bookingModal.descriptionLabel}</label>
                <textarea
                  rows={3}
                  placeholder={t.bookingModal.descriptionPlaceholder}
                  value={bookingDescription}
                  onChange={(e) => setBookingDescription(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Estimated Total Price */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">{t.bookingModal.estimatedTotal}</span>
                <span className="text-base font-black text-amber-400">
                  {bookingType === 'hourly' ? bookingProvider.hourlyRate * 2 : bookingProvider.taskRate} {t.currency}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors shadow-md"
              >
                {t.bookingModal.confirmBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE REVIEW MODAL */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setReviewingBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">{t.reviewModal.title}</h3>
            <p className="text-xs text-slate-400">
              Provider: <span className="text-amber-400 font-semibold">{reviewingBooking.providerName}</span>
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">{t.reviewModal.ratingLabel}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.reviewModal.commentLabel}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={t.reviewModal.commentPlaceholder}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {t.reviewModal.submit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AUTH & PHONE OTP MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center mx-auto mb-2">
                k
              </div>
              <h3 className="text-lg font-bold text-white">{t.authModal.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.authModal.phoneTab}</p>
            </div>

            {authStep === 'phone' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">{t.authModal.nameLabel}</label>
                  <input
                    type="text"
                    value={authNameInput}
                    onChange={(e) => setAuthNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">{t.authModal.phoneLabel}</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <span className="text-slate-400 font-bold">+213</span>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder={t.authModal.phonePlaceholder}
                      className="bg-transparent text-white w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">{t.authModal.roleSelect}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthSelectedRole('client')}
                      className={`p-2 rounded-xl border text-center ${
                        authSelectedRole === 'client' ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthSelectedRole('provider')}
                      className={`p-2 rounded-xl border text-center ${
                        authSelectedRole === 'provider' ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Provider
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthStep('otp')}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
                >
                  {t.authModal.sendOtp}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-center">
                  {t.authModal.mockNotice}
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">{t.authModal.enterOtp}</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg tracking-widest text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserName(authNameInput);
                    setCurrentUserRole(authSelectedRole);
                    if (authSelectedRole === 'provider') setActiveTab('providerDash');
                    setIsAuthOpen(false);
                    setAuthStep('phone');
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t.authModal.verifyBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
              k
            </div>
            <span className="font-bold text-white">khedmaPro</span>
            <span>— {t.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setActiveTab('howItWorks')} className="hover:text-amber-400 transition-colors">
              {t.nav.howItWorks}
            </button>
            <button onClick={() => setActiveTab('forProviders')} className="hover:text-amber-400 transition-colors">
              {t.nav.forProviders}
            </button>
            <button onClick={() => setActiveTab('contact')} className="hover:text-amber-400 transition-colors">
              {t.nav.contact}
            </button>
            <button onClick={() => { setCurrentUserRole('admin'); setActiveTab('adminHub'); }} className="hover:text-amber-400 transition-colors">
              {t.nav.adminHub}
            </button>
          </div>

          <div className="text-slate-500">
            © 2026 khedmaPro DZ. Made for Algeria 🇩🇿
          </div>
        </div>
      </footer>
    </div>
  );
}

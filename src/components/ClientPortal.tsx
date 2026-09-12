import React, { useState } from 'react';
import {
  Heart, Calendar, MessageSquare, Star, MapPin, Check,
  CheckCircle2, AlertCircle, Trash2, ArrowRight, Sparkles, User, Search
} from 'lucide-react';
import { Provider, Booking, CATEGORIES } from '../data/mockData';
import { Language } from '../i18n';

interface ClientPortalProps {
  initialSubTab?: 'saved' | 'bookings';
  savedProviders: Provider[];
  favoriteIds: string[];
  onToggleFavorite: (providerId: string, e?: React.MouseEvent) => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onReviewBooking: (booking: Booking) => void;
  onChatWithPro: (providerId: string) => void;
  onViewProfile: (provider: Provider) => void;
  onBookProvider: (provider: Provider) => void;
  onBrowseMarketplace: () => void;
  lang: Language;
  t: any;
  userName: string;
  getWilayaName: (code: string) => string;
  renderCategoryIcon: (iconName: string, className?: string) => React.ReactNode;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  initialSubTab = 'saved',
  savedProviders,
  favoriteIds,
  onToggleFavorite,
  bookings,
  onCancelBooking,
  onReviewBooking,
  onChatWithPro,
  onViewProfile,
  onBookProvider,
  onBrowseMarketplace,
  lang,
  t,
  userName,
  getWilayaName,
  renderCategoryIcon,
}) => {
  const [subTab, setSubTab] = useState<'saved' | 'bookings'>(initialSubTab);
  const [savedSearch, setSavedSearch] = useState('');

  const filteredSaved = savedProviders.filter((p) => {
    if (!savedSearch.trim()) return true;
    const q = savedSearch.toLowerCase();
    const cat = CATEGORIES.find((c) => c.id === p.category);
    const catName = cat ? (lang === 'ar' ? cat.nameAr : lang === 'fr' ? cat.nameFr : cat.nameEn) : p.category;
    return (
      p.fullName.toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.baladiya.toLowerCase().includes(q)
    );
  });

  const activeBookingsCount = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Client Space Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <User className="w-3.5 h-3.5" />
              <span>{t.clientTab?.title || 'Client Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {userName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              {t.clientTab?.subtitle || 'Manage your saved professionals, service requests, and active bookings.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSubTab('saved')}
              className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border transition-all text-left ${
                subTab === 'saved'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${subTab === 'saved' ? 'text-rose-400 fill-rose-500' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">{t.clientTab?.tabSaved || 'Saved Pros'}</span>
              </div>
              <div className="text-xl font-black text-white">{savedProviders.length}</div>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('bookings')}
              className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border transition-all text-left ${
                subTab === 'bookings'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={`w-4 h-4 ${subTab === 'bookings' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">{t.clientTab?.tabBookings || 'My Bookings'}</span>
              </div>
              <div className="text-xl font-black text-white">{bookings.length}</div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <button
            id="client-subtab-saved"
            type="button"
            onClick={() => setSubTab('saved')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              subTab === 'saved'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Heart className={`w-4 h-4 ${subTab === 'saved' ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{t.clientTab?.tabSaved || 'Saved Professionals'}</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {savedProviders.length}
            </span>
          </button>

          <button
            id="client-subtab-bookings"
            type="button"
            onClick={() => setSubTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              subTab === 'bookings'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.clientTab?.tabBookings || 'My Bookings'}</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {bookings.length}
            </span>
          </button>
        </div>

        <button
          id="client-browse-pro-btn"
          type="button"
          onClick={onBrowseMarketplace}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.clientTab?.findAnotherPro || '+ Find Another Pro'}</span>
        </button>
      </div>

      {/* SUBTAB 1: SAVED / FAVORITE PROFESSIONALS SECTION */}
      {subTab === 'saved' && (
        <div id="saved-professionals-section" className="space-y-6">
          {savedProviders.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Showing </span>
                <span className="font-bold text-white">{filteredSaved.length}</span>
                <span> of {savedProviders.length} saved professionals</span>
              </div>

              {savedProviders.length > 2 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={savedSearch}
                    onChange={(e) => setSavedSearch(e.target.value)}
                    placeholder="Search saved pros..."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {savedProviders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-8 h-8 fill-rose-500/30" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {t.clientTab?.emptySavedTitle || 'No saved professionals yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                {t.clientTab?.emptySavedDesc ||
                  'Tap the heart icon on any provider profile card in the marketplace to save your favorite trusted pros here for easy access.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBrowseMarketplace}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.clientTab?.browseProsBtn || 'Browse Professionals'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSaved.map((p) => {
                const catObj = CATEGORIES.find((c) => c.id === p.category);
                const catName = catObj
                  ? lang === 'ar'
                    ? catObj.nameAr
                    : lang === 'fr'
                    ? catObj.nameFr
                    : catObj.nameEn
                  : p.category;
                const wilayaName = getWilayaName(p.wilayaCode);

                return (
                  <div
                    key={`saved-${p.id}`}
                    id={`saved-card-${p.id}`}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group relative"
                  >
                    <div>
                      {/* Top row: Avatar + Name + Category + Heart Button */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="relative flex-shrink-0">
                          <img
                            src={p.avatarUrl}
                            alt={p.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-colors"
                          />
                          {p.verified && (
                            <div
                              className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5"
                              title={t.card.verified}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              onClick={() => onViewProfile(p)}
                              className="font-bold text-white text-base truncate group-hover:text-amber-400 transition-colors cursor-pointer"
                            >
                              {p.fullName}
                            </h4>

                            {/* Favorite Heart Button */}
                            <button
                              id={`saved-fav-toggle-${p.id}`}
                              type="button"
                              onClick={(e) => onToggleFavorite(p.id, e)}
                              title={t.card.removeFromFavorites || 'Remove from favorites'}
                              className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 transition-all flex-shrink-0"
                            >
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </button>
                          </div>

                          <div className="text-xs font-semibold text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                            {catObj && renderCategoryIcon(catObj.icon, 'w-3.5 h-3.5')}
                            <span>{catName}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="truncate">
                              {p.baladiya}, {wilayaName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">{p.bio}</p>

                      {/* Ratings & Service Coverage */}
                      <div className="flex items-center justify-between bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/80 text-xs mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-white">{p.rating}</span>
                          <span className="text-slate-500">
                            ({p.reviewsCount} {t.card.reviews})
                          </span>
                        </div>
                        {p.crossWilaya ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {t.card.crossWilaya}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">{p.city}</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Pricing & Actions */}
                    <div>
                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80 mb-3">
                        <span className="text-[11px] text-slate-400">{t.card.startingFrom}</span>
                        <div className="text-right">
                          <span className="text-base font-black text-amber-400">
                            {p.hourlyRate} {t.currency}
                          </span>
                          <span className="text-[11px] text-slate-400">{t.card.hourly}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => onViewProfile(p)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-2 rounded-xl border border-slate-700 transition-colors text-center"
                        >
                          {t.card.viewProfile}
                        </button>
                        <button
                          type="button"
                          onClick={() => onChatWithPro(p.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-2 rounded-xl border border-slate-700 transition-colors text-center flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.card.message}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onBookProvider(p)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-2 rounded-xl transition-colors text-center shadow-sm"
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
      )}

      {/* SUBTAB 2: BOOKINGS SECTION */}
      {subTab === 'bookings' && (
        <div id="client-bookings-section" className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">{t.bookingsTab.empty}</p>
              <button
                type="button"
                onClick={onBrowseMarketplace}
                className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-400"
              >
                {t.hero.searchBtn}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const statusColors = {
                  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
                }[b.status];

                return (
                  <div
                    key={b.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
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
                        <div className="text-base font-black text-amber-400">
                          {b.priceEstimate} {t.currency}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => onReviewBooking(b)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5" />
                            {t.bookingsTab.leaveReview}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onChatWithPro(b.providerId)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          {t.bookingsTab.chatWithPro}
                        </button>
                        {b.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => onCancelBooking(b.id)}
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
    </div>
  );
};

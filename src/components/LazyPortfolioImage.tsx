import React, { useState, useEffect, useRef } from 'react';
import { Eye, RefreshCw, Image as ImageIcon, WifiOff, Sparkles } from 'lucide-react';

interface LazyPortfolioImageProps {
  src: string;
  alt?: string;
  index: number;
  totalCount: number;
  dataSaverMode: boolean;
  onOpenLightbox: (index: number) => void;
  lang?: 'en' | 'fr' | 'ar';
}

export const LazyPortfolioImage: React.FC<LazyPortfolioImageProps> = ({
  src,
  alt = 'Portfolio work',
  index,
  totalCount,
  dataSaverMode,
  onOpenLightbox,
  lang = 'en',
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userRequestedLoad, setUserRequestedLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to only load when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;

    // If IntersectionObserver isn't available, fall back to in-view
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Preload slightly before appearing in the modal scrollview
        threshold: 0.05,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine if image should actually fetch
  // In data-saver mode, don't download until user explicitly requests it or unless it's the very first cover thumbnail
  const shouldFetch = (isInView && (!dataSaverMode || userRequestedLoad || index === 0));

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    setUserRequestedLoad(true);
  };

  const handleManualLoad = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserRequestedLoad(true);
  };

  const handleContainerClick = () => {
    if (dataSaverMode && !shouldFetch) {
      setUserRequestedLoad(true);
    } else if (isLoaded) {
      onOpenLightbox(index);
    }
  };

  const t = {
    en: {
      tapToLoad: 'Tap to load (saves data)',
      loading: 'Loading photo...',
      retry: 'Failed to load. Tap to retry',
      expand: 'View photo',
      dataSaverBadge: 'Data Saver',
    },
    fr: {
      tapToLoad: 'Cliquer pour charger (économiser les données)',
      loading: 'Chargement...',
      retry: 'Échec du chargement. Réessayer',
      expand: 'Agrandir la photo',
      dataSaverBadge: 'Éco-données',
    },
    ar: {
      tapToLoad: 'اضغط لتحميل الصورة (توفير البيانات)',
      loading: 'جاري التحميل...',
      retry: 'فشل التحميل. اضغط للمحاولة',
      expand: 'عرض الصورة',
      dataSaverBadge: 'توفير البيانات',
    },
  }[lang] || {
    tapToLoad: 'Tap to load (saves data)',
    loading: 'Loading photo...',
    retry: 'Failed to load. Tap to retry',
    expand: 'View photo',
    dataSaverBadge: 'Data Saver',
  };

  return (
    <div
      ref={containerRef}
      id={`portfolio-img-container-${index}`}
      onClick={handleContainerClick}
      className={`group relative h-40 sm:h-44 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 cursor-pointer select-none transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 ${
        isLoaded ? 'hover:scale-[1.02]' : ''
      }`}
    >
      {/* Skeleton Shimmer when waiting or loading */}
      {(!isLoaded && !hasError && shouldFetch) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 animate-pulse">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[11px] font-medium text-slate-400">{t.loading}</span>
        </div>
      )}

      {/* Data Saver placeholder prior to user click */}
      {dataSaverMode && !shouldFetch && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2 text-amber-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-200">{t.tapToLoad}</p>
          <span className="text-[10px] text-amber-400/90 mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            {t.dataSaverBadge}
          </span>
        </div>
      )}

      {/* Error state with retry button */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950 text-rose-400">
          <WifiOff className="w-6 h-6 mb-1 text-rose-400/80" />
          <p className="text-xs font-medium mb-2">{t.retry}</p>
          <button
            id={`retry-load-btn-${index}`}
            type="button"
            onClick={handleRetry}
            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-lg hover:bg-rose-500/25 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Actual Image with Native Lazy Loading and Async Decoding */}
      {shouldFetch && (
        <img
          id={`portfolio-img-${index}`}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Hover Overlay when loaded */}
      {isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
          <span className="text-[11px] font-medium text-white flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            {t.expand}
          </span>
          <span className="text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
            {index + 1} / {totalCount}
          </span>
        </div>
      )}

      {/* Cover photo badge for index 0 */}
      {index === 0 && isLoaded && (
        <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
          Featured
        </div>
      )}
    </div>
  );
};

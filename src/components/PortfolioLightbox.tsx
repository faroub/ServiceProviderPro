import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PortfolioLightboxProps {
  images: string[];
  currentIndex: number;
  providerName: string;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export const PortfolioLightbox: React.FC<PortfolioLightboxProps> = ({
  images,
  currentIndex,
  providerName,
  onClose,
  onSelectIndex,
}) => {
  const currentImage = images[currentIndex];

  // Handle keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onSelectIndex(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onSelectIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onSelectIndex]);

  return (
    <div
      id="portfolio-lightbox-overlay"
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between text-white max-w-5xl w-full mx-auto py-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base text-slate-100">{providerName}</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button
          id="lightbox-close-btn"
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center relative max-w-5xl w-full mx-auto my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            id="lightbox-prev-btn"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <div className="relative max-h-[75vh] max-w-full flex items-center justify-center">
          <img
            id="lightbox-active-img"
            src={currentImage}
            alt={`${providerName} portfolio project ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800/50"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            id="lightbox-next-btn"
            type="button"
            disabled={currentIndex === images.length - 1}
            onClick={() => onSelectIndex(Math.min(images.length - 1, currentIndex + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 py-3 overflow-x-auto max-w-2xl mx-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

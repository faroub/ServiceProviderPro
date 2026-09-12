import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Hand } from 'lucide-react';

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

  // Zoom and Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Refs for tracking gestures
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialMidpointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  const lastTapRef = useRef<number>(0);

  // Reset zoom whenever image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Fade out hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (scale === 1) {
        if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
          onSelectIndex(currentIndex + 1);
        }
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          onSelectIndex(currentIndex - 1);
        }
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      }
      if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onSelectIndex, scale]);

  // Helper to calculate max allowed drag pan based on container and current scale
  const clampPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (!containerRef.current || !imgRef.current || currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    const container = containerRef.current.getBoundingClientRect();
    const img = imgRef.current.getBoundingClientRect();

    // The overflow width and height beyond the container
    const scaledWidth = img.width;
    const scaledHeight = img.height;

    const maxX = Math.max(0, (scaledWidth - container.width) / 2 + 50);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2 + 50);

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    };
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => {
      const next = Math.min(4, Number((prev + 0.5).toFixed(2)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      else setPosition((p) => clampPosition(p.x, p.y, next));
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double tap or double click to toggle zoom
  const handleToggleZoom = (clientX: number, clientY: number) => {
    if (scale > 1) {
      handleResetZoom();
    } else {
      const targetScale = 2.5;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = clientX - (rect.left + rect.width / 2);
        const offsetY = clientY - (rect.top + rect.height / 2);
        const newPos = clampPosition(-offsetX * (targetScale - 1), -offsetY * (targetScale - 1), targetScale);
        setPosition(newPos);
      }
      setScale(targetScale);
    }
  };

  // Touch Events Setup (Pinch-to-zoom + Pan)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture starting
        e.preventDefault();
        setIsInteracting(true);
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        initialPinchDistRef.current = dist;
        initialScaleRef.current = scale;
        initialPositionRef.current = { ...position };
        initialMidpointRef.current = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const touch = e.touches[0];

        // Double tap detection (< 300ms)
        if (now - lastTapRef.current < 300) {
          e.preventDefault();
          handleToggleZoom(touch.clientX, touch.clientY);
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;

        if (scale > 1) {
          // Pan gesture when zoomed
          setIsInteracting(true);
          dragStartRef.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        const ratio = dist / initialPinchDistRef.current;
        const newScale = Math.min(4, Math.max(1, Number((initialScaleRef.current * ratio).toFixed(2))));

        // Track midpoint delta
        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;
        const deltaX = midX - initialMidpointRef.current.x;
        const deltaY = midY - initialMidpointRef.current.y;

        const newPos = clampPosition(
          initialPositionRef.current.x + deltaX,
          initialPositionRef.current.y + deltaY,
          newScale
        );

        setScale(newScale);
        setPosition(newPos);
      } else if (e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const rawX = touch.clientX - dragStartRef.current.x;
        const rawY = touch.clientY - dragStartRef.current.y;
        const clamped = clampPosition(rawX, rawY, scale);
        setPosition(clamped);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setIsInteracting(false);
        initialPinchDistRef.current = null;
        // Snap back if scale was pinched below 1.05
        setScale((current) => {
          if (current < 1.05) {
            setPosition({ x: 0, y: 0 });
            return 1;
          }
          return current;
        });
      } else if (e.touches.length === 1) {
        initialPinchDistRef.current = null;
        if (scale > 1) {
          dragStartRef.current = {
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y,
          };
        }
      }
    };

    // Non-passive listeners to allow e.preventDefault() during pinch-zoom
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [scale, position, clampPosition]);

  // Wheel zoom support (desktop / trackpad)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.002;
    setScale((prev) => {
      const next = Math.min(4, Math.max(1, Number((prev + zoomFactor).toFixed(2))));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((p) => clampPosition(p.x, p.y, next));
      }
      return next;
    });
  };

  // Mouse pan handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && e.button === 0) {
      e.preventDefault();
      isMouseDownRef.current = true;
      setIsInteracting(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDownRef.current && scale > 1) {
      e.preventDefault();
      const rawX = e.clientX - dragStartRef.current.x;
      const rawY = e.clientY - dragStartRef.current.y;
      const clamped = clampPosition(rawX, rawY, scale);
      setPosition(clamped);
    }
  };

  const handleMouseUp = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsInteracting(false);
    }
  };

  return (
    <div
      id="portfolio-lightbox-overlay"
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-4 select-none animate-fadeIn overflow-hidden"
      onClick={onClose}
    >
      {/* Header Toolbar */}
      <div
        className="flex items-center justify-between text-white max-w-5xl w-full mx-auto py-2 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[200px] sm:max-w-md">
            {providerName}
          </span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Zoom Controls & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              id="lightbox-zoom-out-btn"
              type="button"
              disabled={scale <= 1}
              onClick={handleZoomOut}
              title="Zoom out"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span
              id="lightbox-zoom-level"
              className="text-xs font-semibold px-2 py-0.5 text-amber-400 min-w-[48px] text-center"
            >
              {Math.round(scale * 100)}%
            </span>

            <button
              id="lightbox-zoom-in-btn"
              type="button"
              disabled={scale >= 4}
              onClick={handleZoomIn}
              title="Zoom in"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {scale > 1 && (
              <button
                id="lightbox-reset-zoom-btn"
                type="button"
                onClick={handleResetZoom}
                title="Reset zoom"
                className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 transition-colors border-l border-slate-800 pl-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="lightbox-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        id="lightbox-zoom-stage"
        className="flex-1 flex items-center justify-center relative max-w-5xl w-full mx-auto my-auto overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={(e) => handleToggleZoom(e.clientX, e.clientY)}
      >
        {/* Previous Button (hidden or disabled if zoomed in) */}
        {images.length > 1 && (
          <button
            id="lightbox-prev-btn"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all z-20 shadow-lg ${
              scale > 1 ? 'opacity-30 hover:opacity-100' : ''
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Gestured Image Canvas */}
        <div
          className="relative max-h-[75vh] max-w-full flex items-center justify-center pointer-events-auto select-none"
          style={{
            cursor: scale > 1 ? (isInteracting ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            ref={imgRef}
            id="lightbox-active-img"
            src={currentImage}
            alt={`${providerName} portfolio work ${currentIndex + 1}`}
            draggable={false}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
              transition: isInteracting ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)',
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
            className="max-h-[72vh] sm:max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800/60 select-none pointer-events-none"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            id="lightbox-next-btn"
            type="button"
            disabled={currentIndex === images.length - 1}
            onClick={() => onSelectIndex(Math.min(images.length - 1, currentIndex + 1))}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition-all z-20 shadow-lg ${
              scale > 1 ? 'opacity-30 hover:opacity-100' : ''
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Dynamic Pinch & Zoom Guidance Toast */}
        {showHint && scale === 1 && (
          <div
            id="lightbox-gesture-hint"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-medium text-slate-300 flex items-center gap-1.5 shadow-xl pointer-events-none animate-fadeIn"
          >
            <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Pinch or double-tap to inspect details</span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 py-2 overflow-x-auto max-w-2xl mx-auto z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 opacity-100 shadow-md shadow-amber-500/20'
                  : 'border-transparent opacity-50 hover:opacity-90'
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

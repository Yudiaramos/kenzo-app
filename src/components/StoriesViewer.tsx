'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Media } from '@/types';
import { getStageLabel } from '@/config/wedding';

interface StoriesViewerProps {
  mediaList: Media[];
  onClose: () => void;
  startIndex?: number;
}

const PHOTO_DURATION = 5000; // 5 seconds per photo

export default function StoriesViewer({ mediaList, onClose, startIndex = 0 }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = useMemo(() => mediaList[currentIndex], [mediaList, currentIndex]);
  const isImage = currentMedia?.media_type === 'image';

  const goNext = useCallback(() => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
      setIsPaused(false);
    } else {
      onClose();
    }
  }, [currentIndex, mediaList.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
      setIsPaused(false);
    }
  }, [currentIndex]);

  // Handle image timer
  useEffect(() => {
    if (!currentMedia || !isImage || isPaused) return;

    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / PHOTO_DURATION) * 100;
      if (newProgress >= 100) {
        goNext();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, isImage, isPaused, goNext, currentMedia]);

  // Handle video
  useEffect(() => {
    if (!currentMedia || isImage) return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {
      // Autoplay might be blocked — user needs to tap
    });

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => goNext();

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isImage, goNext, currentMedia]);


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext();
      else goPrev();
    }
    setTouchStartX(null);
  };

  // Tap to navigate (left half = back, right half = forward)
  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else if (x > (rect.width * 2) / 3) {
      goNext();
    } else {
      // Middle area: toggle pause
      setIsPaused((p) => !p);
      if (!isImage && videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    }
  };

  if (!currentMedia) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-[env(safe-area-inset-top,12px)]">
        {mediaList.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-100"
              style={{
                width: `${
                  i < currentIndex ? 100 : i === currentIndex ? progress : 0
                }%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-[calc(env(safe-area-inset-top,12px)+16px)] px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a84c]/80 flex items-center justify-center text-white text-sm font-bold">
              {currentMedia.guest_name?.[0]?.toUpperCase() || '💛'}
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-tight">
                {currentMedia.guest_name || 'Convidado'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">
                  {getStageLabel(currentMedia.stage)}
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-white/60 text-xs">
                  {new Date(currentMedia.created_at).toLocaleString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
                       text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Media content */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentMedia.id}
            src={currentMedia.file_url || ''}
            alt={currentMedia.original_filename || 'Mídia do casamento'}
            className="w-full h-full object-contain animate-story-fade"
          />
        ) : (
          <video
            key={currentMedia.id}
            ref={videoRef}
            src={currentMedia.file_url || ''}
            className="w-full h-full object-contain"
            playsInline
            muted={false}
            preload="auto"
          />
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-0 right-0 z-20 text-center pb-[env(safe-area-inset-bottom,0px)]">
        <span className="text-white/50 text-xs">
          {currentIndex + 1} / {mediaList.length}
        </span>
      </div>
    </div>
  );
}

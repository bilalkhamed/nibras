'use client';

import { Play, Film, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VideoFrameProps {
  src: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function VideoFrame({ src, title, size = 'lg' }: VideoFrameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    full: 'w-full'
  };

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Delayed unmount for exit animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Auto-play slightly after modal opens
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      }, 300);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const videoSrc = src.includes('#') ? src : `${src}#t=1`;

  return (
    <>
      {/* Inline Thumbnail */}
      <div className={`relative mx-auto ${sizeClasses[size]}`}>
        <div className="absolute inset-0 -top-6 -bottom-6 -left-6 -right-6 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl opacity-60 rounded-[3rem] -z-10 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div 
          className="relative aspect-video rounded-3xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl group cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleOpen}
        >
          <video 
            src={videoSrc}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10">
            <div className="z-20 w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.5)] group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
               <Play className="w-10 h-10 ml-2" />
            </div>
            
            {title && (
              <div className="absolute bottom-6 right-8 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Film className="w-4 h-4 text-white/80" />
                <span className="text-white/90 font-medium tracking-wide">
                  {title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isRendered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
          ></div>
          
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className={`absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <X className="w-7 h-7" />
          </button>

          {/* Video Container */}
          <div 
            className={`relative w-full max-w-[95vw] md:max-w-[90vw] aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 transition-all duration-300 transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}
          >
            <video 
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-contain"
              controls
              playsInline
              onEnded={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

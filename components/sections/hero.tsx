'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type BannerItem = {
  _id: string;
  _type: 'image' | 'video';
  title?: string;
  subtitle?: string;
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  image?: { asset?: { url: string } };
  video?: { url: string; mimeType?: string };
  videoPoster?: string;
  buttonText?: string;
  buttonLink?: string;
  ctaText?: string;
  ctaLink?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SLIDE_DURATION = 6000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const convertBannerToMediaItem = (banner: BannerItem, index: number) => {
  const isVideo = banner.mediaType === 'video';
  return {
    _key: banner._id || `banner-${index}`,
    _type: isVideo ? 'video' : 'image',
    asset: isVideo ? undefined : { url: banner.imageUrl || banner.image?.asset?.url || '' },
    videoFile: isVideo
      ? { asset: { url: banner.video?.url || '', mimeType: banner.video?.mimeType } }
      : undefined,
    poster: isVideo ? { asset: { url: banner.videoPoster || '' } } : undefined,
    alt: banner.title || 'Banner',
  };
};

const getActiveBanners = async (): Promise<BannerItem[]> => {
  try {
    const res = await fetch('/api/banner');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

// ─── Animated slide counter ───────────────────────────────────────────────────

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayed, setDisplayed] = useState(value);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setExiting(true);
    const t = setTimeout(() => {
      setDisplayed(value);
      setExiting(false);
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span
      className="inline-block transition-all duration-200"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      {String(displayed + 1).padStart(2, '0')}
    </span>
  );
};

// ─── Slide Media ──────────────────────────────────────────────────────────────

const SlideMedia: React.FC<{
  media: ReturnType<typeof convertBannerToMediaItem>;
  isActive: boolean;
  priority?: boolean;
}> = ({ media, isActive, priority }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (media._type !== 'video' || !videoRef.current) return;
    if (isActive && playing) {
      videoRef.current.play().catch(() => setPlaying(false));
    } else {
      videoRef.current.pause();
      if (!isActive) setPlaying(false);
    }
  }, [playing, isActive, media._type]);

  if (media._type === 'image') {
    return (
      <div className="absolute inset-0">
        {media.asset?.url && (
          <img
            src={media.asset.url}
            alt={media.alt || ''}
            className="w-full h-full object-cover"
            style={{
              transform: isActive ? 'scale(1.06)' : 'scale(1)',
              transition: isActive
                ? `transform ${SLIDE_DURATION + 1200}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : 'transform 900ms ease',
            }}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}
      </div>
    );
  }

  const videoUrl = media.videoFile?.asset?.url;

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]">
      {videoUrl && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={media.poster?.asset?.url}
            className="w-full h-full object-cover"
            muted={muted}
            playsInline
            onEnded={() => setPlaying(false)}
          />
          {/* Play button */}
          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="absolute inset-0 z-10 flex items-center justify-center group"
            >
              <span
                className="
                  w-16 h-16 rounded-full
                  border border-primary/40
                  bg-black/20 backdrop-blur-md
                  flex items-center justify-center
                  group-hover:bg-primary/15 group-hover:border-primary/70
                  group-hover:scale-105
                  transition-all duration-400
                "
              >
                <Play className="w-5 h-5 text-[#E8D5A8] ml-0.5" strokeWidth={1.25} />
              </span>
            </button>
          )}
          {/* Playing controls */}
          {playing && (
            <div className="absolute bottom-6 right-8 z-20 flex gap-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !muted;
                    setMuted((m) => !m);
                  }
                }}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="
                  w-8 h-8 rounded-full
                  bg-black/30 backdrop-blur-sm
                  border border-primary/20
                  flex items-center justify-center
                  text-primary hover:border-primary/50
                  transition-all duration-200
                "
              >
                {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              <button
                onClick={() => setPlaying(false)}
                aria-label="Pause"
                className="
                  w-8 h-8 rounded-full
                  bg-black/30 backdrop-blur-sm
                  border border-primary/20
                  flex items-center justify-center
                  text-primary hover:border-primary/50
                  transition-all duration-200
                "
              >
                <Pause size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero: React.FC<{ className?: string }> = ({ className }) => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch
  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-slide
  const startAutoSlide = useCallback((count: number) => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    if (count <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setSelectedIndex((p) => (p + 1) % count);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    startAutoSlide(banners.length);
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [banners.length, startAutoSlide]);

  // Navigate
  const goTo = useCallback(
    (index: number) => {
      setTextVisible(false);
      setTimeout(() => {
        setSelectedIndex(index);
        setProgressKey((k) => k + 1);
        setTextVisible(true);
      }, 260);
      startAutoSlide(banners.length);
    },
    [banners.length, startAutoSlide]
  );

  const goPrev = () => goTo(selectedIndex === 0 ? banners.length - 1 : selectedIndex - 1);
  const goNext = () => goTo(selectedIndex === banners.length - 1 ? 0 : selectedIndex + 1);

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className={cn('w-full', className)}>
        <div className="relative w-full h-[75vh] md:h-[90vh] bg-[#0e0e0e] overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.04), transparent)',
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
          {/* Skeleton text lines */}
          <div className="absolute bottom-10 left-10 md:left-16 space-y-3">
            <div className="h-3 w-20 rounded bg-white/5" />
            <div className="h-10 w-64 rounded bg-white/5" />
            <div className="h-10 w-48 rounded bg-white/5" />
            <div className="h-3 w-32 rounded bg-white/5 mt-4" />
          </div>
        </div>
        <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
      </section>
    );
  }

  // ── Fallback ──────────────────────────────────────────────────────────────────
  if (!banners.length) {
    return (
      <section className={cn('w-full', className)}>
        <div className="relative w-full h-[75vh] md:h-[90vh] bg-[#0a0a0a] overflow-hidden flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary/50" />
              <span className="text-[9px] tracking-[0.35em] uppercase text-primary font-['Geist',system-ui]">
                New Collection
              </span>
            </div>
            <h1
              className="font-['Cormorant_Garamond'] text-5xl md:text-7xl font-light text-[#f0ece4] leading-[0.92] tracking-tight mb-7"
            >
              Welcome to<br />
              <em className="italic text-[#E8D5A8]">Our Store</em>
            </h1>
            <Link
              href="/products"
              className="
                group inline-flex items-center gap-2.5
                text-[11px] font-light tracking-[0.2em] uppercase
                text-primary border-b border-primary/30 pb-0.5
                hover:border-primary hover:gap-4
                transition-all duration-300
                font-['Geist',system-ui]
              "
            >
              Explore Collection
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const current = banners[selectedIndex];
  const ctaHref = current?.buttonLink || current?.ctaLink;
  const ctaLabel = current?.buttonText || current?.ctaText;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
        @keyframes progressFill { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealLine {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <section
        className={cn('w-full select-none', className)}
        aria-label="Featured collection"
      >
        {/* ── Main slide area ─────────────────────────────────────────────── */}
        <div className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden bg-[#0a0a0a]">

          {/* Cross-fade slides */}
          {banners.map((banner, index) => {
            const media = convertBannerToMediaItem(banner, index);
            const isActive = selectedIndex === index;
            return (
              <div
                key={banner._id || index}
                className="absolute inset-0"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isActive ? 1 : 0,
                }}
                aria-hidden={!isActive}
              >
                <SlideMedia media={media} isActive={isActive} priority={index === 0} />
              </div>
            );
          })}

          {/* Gradient overlays — dark bottom + left edge */}
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.25) 100%)',
            }}
          />
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 60%)',
            }}
          />

          {/* ── Slide counter — top right ── */}
          <div className="absolute top-8 right-8 md:right-12 z-30">
            <div
              className="flex items-baseline gap-1.5 font-['Geist',system-ui] text-white/25"
              style={{ fontSize: '11px', letterSpacing: '0.12em' }}
            >
              <AnimatedNumber value={selectedIndex} />
              <span className="text-white/15 mx-0.5">—</span>
              <span>{String(banners.length).padStart(2, '0')}</span>
            </div>
          </div>

          {/* ── Vertical dot/progress rail — right edge ── */}
          {banners.length > 1 && (
            <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 items-center">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative flex items-start justify-center overflow-hidden"
                  style={{
                    width: 2,
                    height: selectedIndex === i ? 36 : 14,
                    background: selectedIndex === i ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.18)',
                    borderRadius: 999,
                    transition: 'height 0.45s cubic-bezier(0.16,1,0.3,1), background 0.3s',
                  }}
                >
                  {selectedIndex === i && (
                    <div
                      key={progressKey}
                      className="absolute top-0 left-0 right-0 rounded-full bg-primary"
                      style={{
                        animation: `progressFill ${SLIDE_DURATION}ms linear forwards`,
                        transformOrigin: 'top',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Desktop text block ──────────────────────────────────────── */}
          <div className="hidden md:flex absolute inset-0 z-20 items-end p-10 lg:p-16 pb-12 lg:pb-14">
            <div className="max-w-xl">

              {/* Eyebrow line */}
              <div
                key={`eyebrow-${selectedIndex}`}
                className="flex items-center gap-3 mb-6"
                style={{
                  animation: textVisible
                    ? 'fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both'
                    : 'none',
                  opacity: textVisible ? undefined : 0,
                }}
              >
                <div
                  className="h-px bg-primary/45"
                  style={{
                    width: 28,
                    animation: textVisible ? 'revealLine 0.5s ease 0.1s both' : 'none',
                  }}
                />
                <span
                  className="text-[9px] tracking-[0.35em] uppercase text-primary font-['Geist',system-ui]"
                >
                  {current?.mediaType === 'video' ? 'Film' : 'Collection'}
                </span>
              </div>

              {/* Title */}
              {current?.title && (
                <h1
                  key={`title-${selectedIndex}`}
                  className="font-['Cormorant_Garamond'] text-5xl lg:text-[4.5rem] font-light text-[#f0ece4] leading-[0.92] tracking-tight mb-5"
                  style={{
                    animation: textVisible
                      ? 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.12s both'
                      : 'none',
                    opacity: textVisible ? undefined : 0,
                  }}
                >
                  {current.title}
                </h1>
              )}

              {/* Subtitle */}
              {current?.subtitle && (
                <p
                  key={`sub-${selectedIndex}`}
                  className="text-[13px] font-light leading-relaxed tracking-wide text-white/40 mb-8 max-w-sm font-['Geist',system-ui]"
                  style={{
                    animation: textVisible
                      ? 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s both'
                      : 'none',
                    opacity: textVisible ? undefined : 0,
                  }}
                >
                  {current.subtitle}
                </p>
              )}

              {/* CTA */}
              {ctaLabel && ctaHref && (
                <div
                  key={`cta-${selectedIndex}`}
                  style={{
                    animation: textVisible
                      ? 'fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.32s both'
                      : 'none',
                    opacity: textVisible ? undefined : 0,
                  }}
                >
                  <Link
                    href={ctaHref}
                    className="
                      group inline-flex items-center gap-2.5
                      text-[10px] font-light tracking-[0.25em] uppercase
                      text-primary border-b border-primary/30 pb-px
                      hover:border-primary hover:text-[#E8D5A8] hover:gap-4
                      transition-all duration-300
                      font-['Geist',system-ui]
                    "
                  >
                    {ctaLabel}
                    <ArrowUpRight
                      size={12}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Arrow nav — desktop only ── */}
          {banners.length > 1 && (
            <div className="hidden md:flex absolute bottom-10 left-10 lg:left-16 z-30 items-center gap-2">
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="
                  w-9 h-9 flex items-center justify-center
                  border border-white/15 rounded
                  text-white/35 hover:text-primary hover:border-primary/40
                  transition-all duration-250
                "
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.25} />
              </button>
              <button
                onClick={goNext}
                aria-label="Next slide"
                className="
                  w-9 h-9 flex items-center justify-center
                  border border-white/15 rounded
                  text-white/35 hover:text-primary hover:border-primary/40
                  transition-all duration-250
                "
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.25} />
              </button>
            </div>
          )}

          {/* ── Mobile swipe dots ── */}
          {banners.length > 1 && (
            <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
              <div className="flex gap-1.5 items-center bg-black/20 backdrop-blur-md px-3 py-2 rounded-full">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="rounded-full transition-all duration-400"
                    style={{
                      width: selectedIndex === i ? 18 : 5,
                      height: 5,
                      background:
                        selectedIndex === i ? '#C9A96E' : 'rgba(255,255,255,0.25)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile text panel — below image ─────────────────────────────── */}
        <div className="md:hidden bg-[#0a0a0a] px-5 pt-6 pb-8 border-t border-primary/10">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-primary/40" />
            <span className="text-[8px] tracking-[0.35em] uppercase text-primary font-['Geist',system-ui]">
              {current?.mediaType === 'video' ? 'Film' : 'Collection'}
            </span>
          </div>

          {current?.title && (
            <h2
              key={`m-title-${selectedIndex}`}
              className="font-['Cormorant_Garamond'] text-[2.1rem] leading-[1.0] font-light text-[#f0ece4] tracking-tight"
              style={{ animation: 'fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              {current.title}
            </h2>
          )}

          {current?.subtitle && (
            <p
              key={`m-sub-${selectedIndex}`}
              className="text-[12px] text-white/35 mt-2.5 leading-relaxed font-light tracking-wide font-['Geist',system-ui]"
              style={{ animation: 'fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
            >
              {current.subtitle}
            </p>
          )}

          {ctaLabel && ctaHref && (
            <div
              key={`m-cta-${selectedIndex}`}
              style={{ animation: 'fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s both' }}
            >
              <Link
                href={ctaHref}
                className="
                  group inline-flex items-center gap-2 mt-5
                  text-[9px] font-light tracking-[0.25em] uppercase
                  text-primary border-b border-primary/30 pb-px
                  hover:border-primary hover:text-[#E8D5A8] hover:gap-3
                  transition-all duration-300
                  font-['Geist',system-ui]
                "
              >
                {ctaLabel}
                <ArrowUpRight size={11} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          {/* Mobile nav controls */}
          {banners.length > 1 && (
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-white/5">
              <div className="flex items-baseline gap-1.5 font-['Geist',system-ui] text-white/25" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>
                <AnimatedNumber value={selectedIndex} />
                <span className="text-white/15 mx-0.5">·</span>
                <span>{String(banners.length).padStart(2, '0')}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  aria-label="Previous"
                  className="
                    w-8 h-8 flex items-center justify-center rounded
                    border border-white/10
                    text-white/30 hover:text-primary hover:border-primary/35
                    transition-all duration-200 active:scale-95
                  "
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.25} />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Next"
                  className="
                    w-8 h-8 flex items-center justify-center rounded
                    border border-white/10
                    text-white/30 hover:text-primary hover:border-primary/35
                    transition-all duration-200 active:scale-95
                  "
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.25} />
                </button>
              </div>
            </div>
          )}
        </div>

      </section>
    </>
  );
};

export default Hero;
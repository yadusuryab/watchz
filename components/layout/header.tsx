"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, X, ArrowRight, Menu } from "lucide-react";
import Brand from "../utils/brand";

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_LEFT = [
 
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/privacy" },
];

const SCROLL_THRESHOLD = 60;

// ─── Types ────────────────────────────────────────────────────────────────────
type MegaItem = { name: string; tag?: string };
type MegaCol = { label: string; items: MegaItem[] };
type NavItem = { name: string; href?: string; mega?: MegaCol[] };

// ─── MegaMenu ────────────────────────────────────────────────────────────────
function MegaMenu({ cols, open }: { cols: MegaCol[]; open: boolean }) {
  return (
    <div
      className={`
        absolute top-full left-0 right-0 z-40
        bg-[#080808]/97 backdrop-blur-2xl
        border-b border-primary/10
        overflow-hidden transition-all duration-500 ease-out
        ${open ? "max-h-80 py-10 opacity-100" : "max-h-0 py-0 opacity-0"}
      `}
    >
      <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-4 gap-10">
        {cols.map((col) => (
          <div key={col.label}>
            <p className="text-[9px] font-light tracking-[0.3em] uppercase text-primary mb-4 pb-3 border-b border-primary/15">
              {col.label}
            </p>
            {col.items.map((item) => (
              <Link
                key={item.name}
                href="#"
                className="block font-['Cormorant_Garamond'] text-[17px] font-light text-white/50 hover:text-white/95 py-1.5 tracking-wide transition-colors duration-200 no-underline"
              >
                {item.name}
                {item.tag && (
                  <span className="ml-2 text-[9px] tracking-[0.15em] text-primary uppercase align-middle">
                    {item.tag}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SearchOverlay ────────────────────────────────────────────────────────────
function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-[200] bg-[#060606]/97 backdrop-blur-2xl
        flex flex-col items-center justify-center
        transition-opacity duration-400
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <button
        onClick={onClose}
        aria-label="Close search"
        className="absolute top-7 right-9 w-10 h-10 flex items-center justify-center text-white/30 hover:text-white/80 transition-colors duration-200"
      >
        <X className="w-5 h-5" strokeWidth={1.25} />
      </button>

      <div className="w-full max-w-[600px] px-6">
        <p className="text-[9px] font-light tracking-[0.35em] uppercase text-primary mb-6">
          Search Watchz
        </p>
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Reference, collection…"
            autoComplete="off"
            className="
              w-full bg-transparent
              font-['Cormorant_Garamond'] text-[clamp(28px,5vw,48px)] font-light
              text-[#f0ece4] placeholder:text-white/12
              border-0 border-b border-white/12 focus:border-primary/40
              outline-none pb-3 pr-10
              caret-primary transition-colors duration-300
            "
          />
          <button
            type="submit"
            aria-label="Submit search"
            className={`absolute right-0 bottom-3 w-9 h-9 flex items-center justify-center transition-all duration-200 ${
              query.trim()
                ? "text-white/80 hover:text-white"
                : "text-white/20 pointer-events-none"
            }`}
          >
            <ArrowRight className="w-5 h-5" strokeWidth={1.25} />
          </button>
        </form>
        <p className="mt-4 text-[9px] tracking-[0.2em] uppercase text-white/20 hidden sm:block">
          Press Enter to search · Esc to close
        </p>
      </div>
    </div>
  );
}

// ─── MobileMenu ───────────────────────────────────────────────────────────────
function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  return (
    <div
      className={`
        fixed inset-0 z-[150] bg-[#080808]
        flex flex-col
        transition-all duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]
        ${open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-4"}
      `}
    >
      <div className="flex items-center justify-between px-5 h-[60px] shrink-0 border-b border-white/5">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.25} />
        </button>
        <div className="font-['Cormorant_Garamond'] text-[18px] tracking-[0.28em] uppercase text-[#f0ece4]">
          <Brand/>
        </div>
        <div className="w-10" />
      </div>

      <nav className="flex-1 flex flex-col justify-center px-8 gap-0">
        {NAV_LEFT.map((item, i) => (
          <Link
            key={item.name}
            href={item.href ?? "#"}
            onClick={onClose}
            className={`
              flex items-center justify-between
              py-5 border-b border-white/5 last:border-0
              no-underline transition-all duration-200
              ${
                pathname === item.href
                  ? "text-[#f0ece4]"
                  : "text-white/25 hover:text-[#f0ece4]"
              }
            `}
            style={{ transitionDelay: open ? `${i * 50 + 80}ms` : "0ms" }}
          >
            <span className="font-['Cormorant_Garamond'] text-[clamp(28px,8vw,52px)] font-light tracking-tight leading-none">
              {item.name}
            </span>
            <ArrowRight
              className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200 text-primary shrink-0"
              strokeWidth={1.25}
            />
          </Link>
        ))}
      </nav>

      <div className="px-8 pb-10 shrink-0">
    
        <p className="text-[9px] tracking-[0.2em] uppercase text-white/15 mt-6 text-center">
          MADE BY <Link href="https://instagram.com/getshopigo">SHOPIGO</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  // Transparent over dark hero only on home before scroll
  const isOverHero = isHome && !scrolled && !menuOpen && !searchOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setActiveMega(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setActiveMega(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close mega on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleMega = (name: string) =>
    setActiveMega((prev) => (prev === name ? null : name));



  return (
    <>
      {/* ── Search overlay ─────────────────────────────────────────────── */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Mobile full-screen menu ─────────────────────────────────────── */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Main header ────────────────────────────────────────────────── */}
      <header
        ref={megaRef}
        className={`
          fixed top-0 inset-x-0 z-50
          transition-all duration-500 ease-out
          ${
            scrolled || !isHome
              ? "h-[60px] bg-[#0a0a0a]/92 backdrop-blur-2xl border-b border-primary/12"
              : "h-[72px] bg-transparent border-b border-transparent"
          }
        `}
      >
        {/* Gradient scrim so icons are readable over dark hero */}
        {isOverHero && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, transparent 100%)",
            }}
          />
        )}

        <div className="relative h-full max-w-[1440px] mx-auto px-5 sm:px-10">
          <div className="h-full grid grid-cols-[1fr_auto_1fr] items-center gap-6">

            {/* ── LEFT NAV ─────────────────────────────────────────────── */}
            <div className="flex items-center">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`
                  md:hidden w-10 h-10 flex items-center justify-center rounded
                  transition-colors duration-200
                  ${isOverHero ? "text-white/60 hover:text-white hover:bg-white/10" : "text-white/40 hover:text-white/80 hover:bg-white/5"}
                `}
              >
                <Menu className="w-[17px] h-[17px]" strokeWidth={1.25} />
              </button>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-0" aria-label="Main navigation">
                {NAV_LEFT.map((item) => {
                 
                  return (
                    <Link
                      key={item.name}
                      href={item.href ?? "#"}
                      className={`
                        relative px-4 py-2 text-[10.5px] font-light tracking-[0.22em] uppercase
                        font-['Geist',system-ui] no-underline transition-colors duration-300
                        group
                        ${
                          
                           "text-white/45 hover:text-white/90"
                        }
                      `}
                    >
                      {item.name}
                      <span
                        className={`
                          absolute bottom-1 left-4 right-4 h-px bg-primary
                          transition-transform duration-400 origin-left
 scale-x-0 group-hover:scale-x-100
                        `}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ── CENTER LOGO ──────────────────────────────────────────── */}
            <Link
              href="/"
              aria-label="Watchz home"
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity duration-300 no-underline"
            >
            <Brand/>
            </Link>

            {/* ── RIGHT ACTIONS ────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className={`
                  w-10 h-10 flex items-center justify-center rounded
                  transition-all duration-300
                  ${
                    isOverHero
                      ? "text-white/50 hover:text-white hover:bg-white/8"
                      : "text-white/35 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                <Search
                  className={`transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-[17px] h-[17px]"}`}
                  strokeWidth={1.25}
                />
              </button>

              {/* Wishlist */}
           

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Shopping cart"
                className={`
                  relative w-10 h-10 flex items-center justify-center rounded
                  transition-all duration-300 no-underline
                  ${
                    isOverHero
                      ? "text-white/50 hover:text-white hover:bg-white/8"
                      : "text-white/35 hover:text-white/80 hover:bg-white/5"
                  }
                `}
              >
                <ShoppingBag
                  className={`transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-[17px] h-[17px]"}`}
                  strokeWidth={1.25}
                />
                {/* Cart indicator dot */}
                <span className="absolute top-2 right-2 w-[5px] h-[5px] rounded-full bg-primary" />
              </Link>

              {/* Private appointment CTA — hidden on mobile */}
           
            </div>
          </div>
        </div>

        {/* ── Mega menu (desktop) ──────────────────────────────────────── */}
     
      </header>

      {/* Spacer — only on non-home pages where header is always solid */}
      {!isHome && <div className="h-[60px]" aria-hidden="true" />}
    </>
  );
}
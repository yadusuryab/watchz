'use client'

import React, { useEffect, useRef, useState } from 'react'
import CategoryCard from '../cards/category-card'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export type Category = {
  name: string
  image: string
  slug: string
  productCount?: number
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-none bg-neutral-900 ${tall ? 'h-[480px]' : 'h-[280px]'}`}
      style={{ background: '#111' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,220,120,0.04), transparent)',
          animation: 'shimmer 1.8s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// ── Number Label ──────────────────────────────────────────────────────────────
function IndexLabel({ n }: { n: number }) {
  return (
    <span
      style={{
        fontFamily: '"DM Mono", "Courier New", monospace',
        fontSize: '10px',
        letterSpacing: '0.18em',
        opacity: 0.8,
      }}
      className='text-primary'
    >
      {String(n).padStart(2, '0')}
    </span>
  )
}

// ── Single Category Row ───────────────────────────────────────────────────────
function CategoryRow({
  cat,
  index,
  visible,
  tall,
}: {
  cat: Category
  index: number
  visible: boolean
  tall?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={`/products?category=${cat.slug}`}
      className="block group relative overflow-hidden"
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: tall ? '480px' : '260px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity 0.7s ease ${index * 100}ms, transform 0.7s ease ${index * 100}ms`,
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${cat.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: hovered
              ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)',
            transition: 'background 0.5s ease',
          }}
        />

        {/* Gold grain texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
            opacity: 0.4,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />

        {/* Index number — top left */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '22px',
            opacity: visible ? 1 : 0,
            transition: `opacity 0.6s ease ${index * 100 + 200}ms`,
          }}
        >
          <IndexLabel n={index + 1} />
        </div>

        {/* Gold accent line — left edge */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'linear-gradient(to bottom, transparent, #b8924a, transparent)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Bottom text block */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '28px 24px 24px',
          }}
        >
          {/* Category name */}
          <h3
            style={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontSize: tall ? '42px' : '28px',
              fontWeight: 400,
              color: '#f5f0e8',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              margin: 0,
              transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 0.4s ease',
            }}
          >
            {cat.name}
          </h3>

          {/* Bottom row: product count + arrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              opacity: hovered ? 1 : 0.55,
              transform: hovered ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <span
              style={{
                fontFamily: '"DM Mono", "Courier New", monospace',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
              className='text-primary'
            >
              {cat.productCount != null ? `${cat.productCount} pieces` : 'Explore'}
            </span>

            <div
              style={{
                width: '32px',
                height: '32px',
             
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hovered ? 'rgba(184,146,74,0.15)' : 'transparent',
                transition: 'background 0.3s ease',
              }}
              className='text-primary border-primary border-2'
            >
              <ArrowUpRight size={13}  />
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

// ── CategorySection ───────────────────────────────────────────────────────────
function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Fetch
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Invalid data')
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
        setCategories([
          { name: 'Men',         image: '/category-men.avif',         slug: 'men',         productCount: 84 },
          { name: 'Women',       image: '/category-women.avif',       slug: 'women',       productCount: 112 },
          { name: 'Accessories', image: '/category-accessories.avif', slug: 'accessories', productCount: 56 },
          { name: 'Footwear',    image: '/category-footwear.avif',    slug: 'footwear',    productCount: 39 },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Intersection observer
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.04 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Split layout: first item is hero (tall), rest are 2-col grid
  const [hero, ...rest] = categories

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@300;400&display=swap');
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          padding: '64px 0 80px',
          position: 'relative',
        }}
      >
        {/* ── Decorative top rule ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '24px',
            right: '24px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(184,146,74,0.3), transparent)',
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            padding: '0 24px',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <div style={{ width: '28px', height: '1px', opacity: 0.6 }} className='bg-primary' />
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '9px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
                className='text-primary'
              >
                Collections
              </span>
            </div>

            {/* headline */}
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.55s ease 0.07s, transform 0.55s ease 0.07s',
              }}
            >
              Curated for you.
            </h2>
          </div>

          {/* View all link */}
          <Link
            href="/products"
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderBottom: '1px solid rgba(184,146,74,0.3)',
              paddingBottom: '2px',
              opacity: visible ? 0.8 : 0,
              transition: 'opacity 0.5s ease 0.15s',
            }}
            className='text-primary'
          >
            View all <ArrowUpRight size={10} />
          </Link>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <SkeletonCard tall />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : categories.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '48px 0', fontFamily: 'monospace', fontSize: '12px' }}>
            No collections found
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 24px' }}>
            {/* Hero row */}
            {hero && (
              <CategoryRow cat={hero} index={0} visible={visible} tall />
            )}

            {/* 2-column grid for the rest */}
            {rest.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: rest.length === 1 ? '1fr' : '1fr 1fr',
                  gap: '3px',
                }}
              >
                {rest.map((cat, i) => (
                  <CategoryRow key={cat.slug} cat={cat} index={i + 1} visible={visible} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Decorative bottom rule ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '24px',
            right: '24px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(184,146,74,0.3), transparent)',
          }}
        />

        {/* Dev error notice */}
        {error && process.env.NODE_ENV === 'development' && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '10px 14px',
              background: 'rgba(184,146,74,0.08)',
              border: '1px solid rgba(184,146,74,0.2)',
              borderRadius: '4px',
            }}
          >
            <p style={{ color: '#b8924a', fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>
              Fallback data: {error}
            </p>
          </div>
        )}
      </section>
    </>
  )
}

export default CategorySection
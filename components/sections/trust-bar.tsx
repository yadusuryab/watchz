"use client";

import React, { useEffect, useRef, useState } from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones, Verified } from "lucide-react";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const badges = [
  {
    icon: Verified,
    title: "Premium Products.",
    desc: "Quality and premium products at affordable price.",
    tag: "01",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Hassle-free returns for damaged or defective items",
    tag: "02",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    desc: "100% protected payments",
    tag: "03",
  },
  {
    icon: Headphones,
    title: "24h Support",
    desc: "We're here when you need us",
    tag: "04",
  },
];

export default function TrustBar() {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap');

        @keyframes trustSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .trust-item {
          opacity: 0;
        }
        .trust-item.in {
          animation: trustSlideIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .trust-icon-ring {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .trust-item:hover .trust-icon-ring {
          transform: scale(1.12) rotate(-6deg);
        }
        .trust-slash {
          transition: width 0.4s ease;
          width: 0;
        }
        .trust-item.in .trust-slash {
          width: 20px;
          transition-delay: inherit;
        }
      `}</style>

      <section style={{ padding: "20px 16px" }}>
        {/* Outer tape strip — dark */}
        <div
          ref={ref}
          style={{
            background: "#111",
            borderTop: "2px solid #11443d",
            borderBottom: "2px solid #11443d",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle diagonal grain */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px)",
              pointerEvents: "none",
            }}
          />

          {/* 4 items in a row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            <style>{`@media(min-width:768px){ .trust-grid{ grid-template-columns: repeat(4,1fr) !important; } }`}</style>

            {badges.map(({ icon: Icon, title, desc, tag }, i) => {
              const isLast = i === badges.length - 1;
              const isHov = hovered === i;

              return (
                <div
                  key={i}
                  className={`trust-item ${visible ? "in" : ""}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    animationDelay: `${i * 90}ms`,
                    padding: "28px 20px 26px",
                    borderRight: !isLast ? "1px solid rgba(201,168,76,0.2)" : "none",
                    borderBottom: i < 2 ? "1px solid rgba(201,168,76,0.2)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    cursor: "default",
                    background: isHov ? "rgba(201,168,76,0.05)" : "transparent",
                    transition: "background 0.3s ease",
                    position: "relative",
                  }}
                >
                  {/* Tag number — top right */}
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "14px",
                      fontFamily: '"DM Mono", monospace',
                      fontSize: "8px",
                      letterSpacing: "0.2em",
                      color: "rgba(201,168,76,0.35)",
                    }}
                  >
                    {tag}
                  </span>

                  {/* Icon */}
                  <div
                    className="trust-icon-ring"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: `1px solid ${isHov ? "#11443d" : "rgba(201,168,76,0.35)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isHov ? "rgba(201,168,76,0.12)" : "transparent",
                      transition: "border-color 0.3s ease, background 0.3s ease",
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      color={isHov ? "#11443d" : "rgba(255,255,255,0.5)"}
                      style={{ transition: "color 0.3s ease" }}
                    />
                  </div>

                  {/* Text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {/* Title row with slash */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="trust-slash"
                        style={{
                          height: "1px",
                          background: "#11443d",
                          flexShrink: 0,
                          transitionDelay: `${i * 90 + 200}ms`,
                        }}
                      />
                      <p
                        style={{
                          fontFamily: '"Bebas Neue", Impact, sans-serif',
                          fontSize: "15px",
                          letterSpacing: "0.12em",
                          color: "#f5f0e8",
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {title}
                      </p>
                    </div>

                    <p
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: "9.5px",
                        letterSpacing: "0.05em",
                        color: "rgba(255,255,255,0.3)",
                        margin: 0,
                        lineHeight: 1.5,
                        paddingLeft: "28px",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
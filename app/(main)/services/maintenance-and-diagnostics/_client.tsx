"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollButton from "@/app/components/ui/ScrollButton";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { type LC, isRtl } from "@/app/i18n/config";
import { useLang } from "@/app/hooks/useLang";

const UI: Record<LC, { breadHome: string; breadServices: string; breadCurrent: string }> = {
  EN: { breadHome: "Home", breadServices: "Services", breadCurrent: "Maintenance and diagnostics" },
  AR: { breadHome: "الرئيسية", breadServices: "الخدمات", breadCurrent: "الصيانة والتشخيص" },
  ES: { breadHome: "Inicio", breadServices: "Servicios", breadCurrent: "Mantenimiento y diagnósticos" },
  FR: { breadHome: "Accueil", breadServices: "Services", breadCurrent: "Maintenance et diagnostics" },
};

type Props = {
  heroHeading: string;
  heroBody: string;
  sectionHeading: string;
  sectionBody: string;
  heroImageUrl: string;
  sectionImageUrl: string;
  heroLines: string[];
};

const SETS = 3;

const carouselItems = [
  {
    tabLabel: { EN: "Servicing and inspection", AR: "الخدمة والتفتيش", ES: "Servicio e inspección", FR: "Service et inspection" },
    heading: "Servicing and inspection",
    body: "Scheduled and unscheduled servicing, pre-delivery inspections, compliance checks. The routine work that keeps equipment legal and operational.",
    pills: ["Fleet-tailored schedules", "Pre-delivery inspections", "Pre-sale inspections", "Compliance checks", "Manufacturer spec sign-off"],
    href: "/services/servicing-and-inspection",
    imageUrl: "/images/maintenance-servicing-and-inspection-hero.jpg",
  },
  {
    tabLabel: { EN: "Advanced diagnostics", AR: "تشخيص متقدم", ES: "Diagnóstico avanzado", FR: "Diagnostics avancés" },
    heading: "Advanced diagnostics",
    body: "Most providers stop when it gets complicated. We don't. AST's diagnostic capability spans multiple manufacturers and equipment types, which means when your ground fleet has a problem, we can actually find it.",
    pills: ["Multi-brand fault finding", "Electrical diagnostics", "Hydraulic diagnostics", "Mechanical diagnostics", "Detailed fault reporting"],
    href: "#",
    imageUrl: "/images/maintenance-advanced-diagnostics-hero.jpg",
  },
  {
    tabLabel: { EN: "Emergency repairs", AR: "إصلاحات طارئة", ES: "Reparaciones de emergencia", FR: "Réparations d'urgence" },
    heading: "Emergency repairs",
    body: "Equipment failure doesn't wait for a convenient moment. AST responds fast, with the right engineers and the right parts, to get your fleet back in service with minimum disruption.",
    pills: ["Rapid response", "Unplanned breakdown cover", "Multi-manufacturer engineers", "Priority turnaround"],
    href: "#",
    imageUrl: "/images/maintenance-servicing-and-inspection-hero.jpg",
  },
  {
    tabLabel: { EN: "Refurbishment", AR: "تجديد", ES: "Reacondicionamiento", FR: "Remise en état" },
    heading: "Refurbishment",
    body: "Replacing equipment isn't always the answer. AST refurbishes ground support equipment to operational standard, extending asset life and delivering better value than an outright replacement.",
    pills: ["Full refurbishment", "Partial refurbishment", "Structural restoration", "Mechanical restoration", "Pre-handover sign-off"],
    href: "#",
    imageUrl: "/images/maintenance-advanced-diagnostics-hero.jpg",
  },
  {
    tabLabel: { EN: "Fire tender maintenance", AR: "صيانة سيارات الإطفاء", ES: "Mantenimiento de bombas", FR: "Maintenance des véhicules anti-incendie" },
    heading: "Fire tender maintenance",
    body: "Airside fire tenders operate to a different standard. AST has the specialist knowledge to service, inspect and repair fire appliances to the exacting requirements aviation demands.",
    pills: ["Scheduled servicing", "Compliance inspections", "Foam system repairs", "Pump system repairs", "Regulatory sign-off"],
    href: "#",
    imageUrl: "/images/maintenance-servicing-and-inspection-hero.jpg",
  },
];

const loopItems = [...carouselItems, ...carouselItems, ...carouselItems];

export default function MaintenancePageClient({
  heroHeading: _heroHeading,
  heroBody,
  sectionHeading: _sectionHeading,
  sectionBody: _sectionBody,
  heroImageUrl,
  sectionImageUrl: _sectionImageUrl,
  heroLines,
}: Props) {
  const lang = useLang();
  const t = UI[lang];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ctaHovered, setCtaHovered] = useState(false);

  // ── Ghost height measurement ─────────────────────────────────────────────
  // Ghost items use paddingTop: 62 (matching the content wrapper's paddingTop)
  // so offsetHeight includes the 62px gap — no margin-collapsing surprises.
  const ghostRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const rightColRef  = useRef<HTMLDivElement>(null);
  const [colMinHeight, setColMinHeight] = useState(0);

  const measureGhosts = () => {
    const max = ghostRefs.current.reduce(
      (h, el) => Math.max(h, el?.offsetHeight ?? 0), 0
    );
    if (max > 0) setColMinHeight(max);
  };

  // Initial measurement (before first paint)
  useLayoutEffect(measureGhosts, []);

  // Re-measure whenever the right column changes size (viewport resize, etc.)
  useEffect(() => {
    if (!rightColRef.current) return;
    const ro = new ResizeObserver(measureGhosts);
    ro.observe(rightColRef.current);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Image crossfade ──────────────────────────────────────────────────────
  const [displayedImageIndex, setDisplayedImageIndex] = useState(0);
  const [imgOpacity, setImgOpacity] = useState(1);
  const imgFadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (currentIndex === displayedImageIndex) return;
    setImgOpacity(0);
    clearTimeout(imgFadeTimer.current);
    imgFadeTimer.current = setTimeout(() => {
      setDisplayedImageIndex(currentIndex);
      setImgOpacity(1);
    }, 250);
    return () => clearTimeout(imgFadeTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Content fade ─────────────────────────────────────────────────────────
  const [displayedContentIndex, setDisplayedContentIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const contentFadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (currentIndex === displayedContentIndex) return;
    setContentVisible(false);
    clearTimeout(contentFadeTimer.current);
    contentFadeTimer.current = setTimeout(() => {
      setDisplayedContentIndex(currentIndex);
      setContentVisible(true);
    }, 200);
    return () => clearTimeout(contentFadeTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const displayedContent = carouselItems[displayedContentIndex];
  const displayedImage   = carouselItems[displayedImageIndex];

  // ── Pill carousel ────────────────────────────────────────────────────────
  const trackRef        = useRef<HTMLDivElement>(null);
  const trackMotionRef  = useRef<HTMLDivElement>(null);
  const pillRefs        = useRef<(HTMLButtonElement | null)[]>([]);
  const setWidthRef     = useRef(0);
  const currentXRef     = useRef(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [trackReady, setTrackReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Drag state — all refs so they never cause re-renders
  const isPointerDown   = useRef(false);
  const isDragging      = useRef(false);
  const pointerDownX    = useRef(0);
  const xAtPointerDown  = useRef(0);
  const swallowNextClick = useRef(false);

  function applyX(v: number, animated = false) {
    const el = trackMotionRef.current;
    if (!el) return;
    el.style.transition = animated ? "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none";
    el.style.transform  = `translateX(${v}px)`;
    currentXRef.current = v;
  }

  const measurePills = () => {
    const firstSet = pillRefs.current.slice(0, carouselItems.length);
    if (firstSet.some(p => !p)) return;
    const sw = firstSet.reduce((sum, p) => sum + (p?.offsetWidth ?? 0), 0);
    setWidthRef.current = sw;
    const p0 = firstSet[0]?.offsetWidth ?? 0;
    const p1 = firstSet[1]?.offsetWidth ?? 0;
    setTrackWidth(p0 + p1);
    applyX(-sw);
  };

  // Measure on mount
  useLayoutEffect(measurePills, []);

  // Re-measure when language changes — pill labels change width
  useLayoutEffect(() => {
    // Small defer so the DOM has updated with the new label text
    const id = requestAnimationFrame(measurePills);
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Enable width transition after first paint so the initial measurement doesn't animate
  useEffect(() => { setTrackReady(true); }, []);

  // Track desktop breakpoint for pill viewport sizing
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Update viewport width synchronously with position changes (useLayoutEffect so
  // there's no intermediate frame where track is at new position but old width)
  useLayoutEffect(() => {
    const p0 = pillRefs.current[currentIndex];
    const p1 = pillRefs.current[(currentIndex + 1) % carouselItems.length];
    if (p0 && p1) setTrackWidth(p0.offsetWidth + p1.offsetWidth);
  }, [currentIndex]);

  function snapToIndex(idx: number) {
    const sw = setWidthRef.current;
    if (!sw) return;
    const xNow = currentXRef.current;
    const pillOffset = pillRefs.current
      .slice(0, idx)
      .reduce((s, p) => s + (p?.offsetWidth ?? 0), 0);
    let bestTarget = 0, bestDist = Infinity;
    for (let s = 0; s < SETS; s++) {
      const candidate = -(s * sw + pillOffset);
      const dist = Math.abs(candidate - xNow);
      if (dist < bestDist) { bestDist = dist; bestTarget = candidate; }
    }
    applyX(bestTarget, true);
    // After the snap animation, silently renormalize to the middle set so
    // there is always one full set of buffer on both sides (infinite loop).
    const middleTarget = -(sw + pillOffset);
    if (bestTarget !== middleTarget) {
      setTimeout(() => applyX(middleTarget, false), 420);
    }
  }

  const advance = () => {
    const next = (currentIndex + 1) % carouselItems.length;
    snapToIndex(next);
    setCurrentIndex(next);
  };

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isPointerDown.current  = true;
    isDragging.current     = false;
    pointerDownX.current   = e.clientX;
    xAtPointerDown.current = currentXRef.current;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPointerDown.current || e.buttons === 0) return;

    const totalDelta = e.clientX - pointerDownX.current;

    // Activate drag only after 5px movement
    if (!isDragging.current) {
      if (Math.abs(totalDelta) < 5) return;
      isDragging.current = true;
      document.body.style.cursor = "grabbing";
    }

    // Compute new position from drag-start baseline (handles large drags cleanly)
    let newX = xAtPointerDown.current + totalDelta;
    const sw = setWidthRef.current;
    if (sw) {
      if (newX <= -(sw * (SETS - 1))) newX += sw;
      else if (newX >= 0) newX -= sw;
    }
    applyX(newX);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isPointerDown.current = false;
    document.body.style.cursor = "";
    if (!isDragging.current) return; // was a tap — let button onClick fire normally
    isDragging.current = false;
    swallowNextClick.current = true; // suppress the post-drag click on child buttons

    const sw = setWidthRef.current;
    if (!sw) return;
    const xNow = currentXRef.current;
    const inSet = ((-xNow % sw) + sw) % sw;
    let cum = 0, bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < carouselItems.length; i++) {
      const pw = pillRefs.current[i]?.offsetWidth ?? 0;
      const d  = Math.abs(cum - inSet);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
      cum += pw;
    }
    setCurrentIndex(bestIdx);
    snapToIndex(bestIdx);
  }

  return (
    <div className="maintenance-page" dir={isRtl(lang) ? "rtl" : "ltr"}>

      {/* ── Dark hero section ─────────────────────────────────────────────── */}
      <section className="maintenance-hero relative bg-blue text-white flex flex-col overflow-hidden">
        <div className="relative z-10 flex flex-col flex-1 min-h-0 nav-offset">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1 min-h-0">
            <main className="flex flex-col flex-1 min-h-0">

              <div className="page-px max-w-[1440px] mx-auto w-full">
                <Breadcrumbs crumbs={[
                  { label: t.breadHome, href: "/" },
                  { label: t.breadServices, href: "/services/maintenance-and-diagnostics" },
                  { label: t.breadCurrent },
                ]} />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] pb-6 lg:pb-[80px]">
                  <div className="md:col-span-6 lg:col-span-5">
                    <h1
                      className="text-white text-[2rem] leading-[2.25rem] md:text-[2.75rem] md:leading-[3rem] lg:text-[3.375rem] lg:leading-[3.625rem]"
                      style={{ fontFamily: "var(--font-almaren-nueva)", fontWeight: 21 }}
                    >
                      {heroLines.map((line: string, i: number) => (
                        <span key={i}>
                          {i === heroLines.length - 1
                            ? <span style={{ color: "#00ff7e" }}>{line}</span>
                            : line}
                          {i < heroLines.length - 1 && <br />}
                        </span>
                      ))}
                    </h1>
                  </div>
                  <div className="md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7 flex flex-col justify-center gap-[24px] lg:gap-[44px]">
                    <p className="text-white" style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 400, lineHeight: "1.5rem" }}>
                      {heroBody}
                    </p>
                    <div><ScrollButton targetId="more" /></div>
                  </div>
                </div>
              </div>

              <div className="page-px flex-1 min-h-[150px] hero-image-wrap">
                <div className="overflow-hidden w-full h-full" style={{ borderRadius: 32 }}>
                  <Image
                    src={heroImageUrl}
                    alt="GSE maintenance technician at work"
                    width={2000}
                    height={875}
                    className="w-full h-full object-cover object-center"
                    priority
                  />
                </div>
              </div>

            </main>
          </div>
        </div>
      </section>

      {/* ── Services carousel section ──────────────────────────────────────── */}
      <section
        id="more"
        className="flex flex-col justify-center py-[80px] lg:py-[160px]"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-[1440px] mx-auto page-px w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-[32px] lg:gap-[24px]">

            {/* ── Left: portrait image ────────────────────────────────────── */}
            <div className="lg:col-span-5 lg:row-start-1">
              {/*
                Container is `relative` + `overflow-hidden` so fill Image resolves its
                dimensions and the zoom scale is clipped at the border-radius edge.
                Opacity fade is on a separate wrapper div so it doesn't share a CSS
                `transition` declaration with the transform on the Image.
              */}
              <div
                className="group overflow-hidden carousel-image-wrap w-full lg:max-w-[543px]"
                style={{ borderRadius: 32 }}
              >
                {/* Fade wrapper */}
                <div style={{ width: "100%", height: "100%", opacity: imgOpacity, transition: "opacity 0.25s ease-out" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayedImage.imageUrl}
                    alt={displayedImage.heading}
                    className="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Right: content ──────────────────────────────────────────── */}
            <div
              ref={rightColRef}
              className="lg:col-span-6 lg:col-start-7 lg:row-start-1 flex flex-col"
              style={{ position: "relative" }}
            >

              {/* Pill toggle ───────────────────────────────────────────────── */}
              <div
                className="carousel-toggle"
                dir="ltr"
                translate="no"
                style={{ padding: 6, borderRadius: 100, background: "#F6F5F3" }}
              >
                {/* Overflow-hidden viewport — full-width on mobile, pill-sized on desktop */}
                <div
                  ref={trackRef}
                  style={{
                    overflow: "hidden",
                    borderRadius: 100,
                    ...(isDesktop
                      ? { width: trackWidth, transition: trackReady ? "width 300ms ease" : "none" }
                      : { flex: 1 }),
                  }}
                >
                  <div
                    ref={trackMotionRef}
                    style={{ display: "flex", width: "max-content", cursor: "grab", willChange: "transform", userSelect: "none", touchAction: "pan-y" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {loopItems.map((item, i) => {
                      const origIdx = i % carouselItems.length;
                      const isActive = origIdx === currentIndex;
                      return (
                        <button
                          key={i}
                          ref={i < carouselItems.length ? (el) => { pillRefs.current[i] = el; } : undefined}
                          onClick={() => {
                            // Swallow the click that fires immediately after a drag ends
                            if (swallowNextClick.current) { swallowNextClick.current = false; return; }
                            setCurrentIndex(origIdx);
                            snapToIndex(origIdx);
                          }}
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            padding: "8px 16px",
                            alignItems: "center",
                            borderRadius: 100,
                            background: isActive ? "#151129" : "transparent",
                            color: isActive ? "#ffffff" : "#151129",
                            border: "none",
                            cursor: "inherit",
                            fontFamily: "var(--font-inter)",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: "20px",
                            whiteSpace: "nowrap",
                            transition: "background-color 300ms, color 300ms",
                          }}
                        >
                          {item.tabLabel[lang] ?? item.tabLabel.EN}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next arrow */}
                <button
                  onClick={advance}
                  aria-label="Next service"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#00FF7E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginLeft: 6,
                  }}
                >
                  <ArrowRight size={14} color="#141127" strokeWidth={2.5} style={{ transform: isRtl(lang) ? "scaleX(-1)" : "none" }} />
                </button>
              </div>

              {/* Ghost containers — measure tallest content state on mount ── */}
              {/* paddingTop: 62 matches the real content wrapper, so offsetHeight */}
              {/* includes the gap — no margin-collapsing discrepancy.           */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: "100%", top: 0, left: 0 }}
              >
                {carouselItems.map((item, i) => (
                  <div
                    key={`ghost-${i}`}
                    ref={(el) => { ghostRefs.current[i] = el; }}
                    className="crs-pad"
                  >
                    <h2 style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "clamp(32px, 3.5vw, 46px)", fontWeight: 21, lineHeight: "1.13" }}>
                      {item.heading}
                    </h2>
                    <p className="crs-mt1" style={{ fontFamily: "var(--font-inter)", fontSize: 16, lineHeight: "24px" }}>
                      {item.body}
                    </p>
                    <div className="crs-mt2" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {(isDesktop ? item.pills : [...item.pills].sort((a, b) => a.length - b.length)).map((pill, j) => (
                        <span key={j} style={{ display: "inline-flex", padding: "8px 16px", borderRadius: 100, fontSize: 14, lineHeight: "20px", whiteSpace: "nowrap" }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                    <div className="crs-mt3" style={{ height: 46 }} />
                  </div>
                ))}
              </div>

              {/* Content ────────────────────────────────────────────────────── */}
              {/* paddingTop instead of marginTop on the child — prevents the    */}
              {/* child's margin from collapsing out of this box, which would    */}
              {/* make minHeight understated and cause vertical jumping.          */}
              <div className="crs-pad" style={{ minHeight: colMinHeight || undefined }}>
                <div
                  style={{
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-almaren-nueva)",
                      fontSize: "clamp(32px, 3.5vw, 46px)",
                      fontWeight: 21,
                      lineHeight: "1.13",
                      color: "#151129",
                    }}
                  >
                    {displayedContent.heading}
                  </h2>

                  <p
                    className="crs-mt1"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 16,
                      fontWeight: 400,
                      lineHeight: "24px",
                      color: "#151129",
                    }}
                  >
                    {displayedContent.body}
                  </p>

                  <div className="crs-mt2" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(isDesktop ? displayedContent.pills : [...displayedContent.pills].sort((a, b) => a.length - b.length)).map((pill, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          padding: "8px 16px",
                          alignItems: "center",
                          borderRadius: 100,
                          fontFamily: "var(--font-inter)",
                          fontSize: 14,
                          fontWeight: 400,
                          lineHeight: "20px",
                          color: "#151129",
                          background: "#F6F5F3",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>

                  <div className="crs-mt3">
                    <Link
                      href={displayedContent.href}
                      className="inline-flex items-center"
                      onMouseEnter={() => setCtaHovered(true)}
                      onMouseLeave={() => setCtaHovered(false)}
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.9375rem",
                        paddingBlock: 8,
                        paddingInlineStart: 20,
                        paddingInlineEnd: 8,
                        gap: 12,
                        backgroundColor: "#00FF7E",
                        color: "#141127",
                        borderRadius: 100,
                        border: "1px solid #00FF7E",
                        textDecoration: "none",
                      }}
                    >
                      Learn more
                      <span
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 30,
                          height: 30,
                          background: ctaHovered ? "#00FF7E" : "#141127",
                          transition: "background-color 300ms ease",
                        }}
                      >
                        <ArrowRight
                          size={14}
                          strokeWidth={2.5}
                          style={{
                            color: ctaHovered ? "#141127" : "#ffffff",
                            transition: "color 300ms ease",
                            transform: isRtl(lang) ? "scaleX(-1)" : "none",
                          }}
                        />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

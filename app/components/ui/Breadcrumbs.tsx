"use client";

import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const mobileCrumbs = crumbs.slice(-2);

  const renderCrumb = (crumb: Crumb, i: number, arr: Crumb[]) => {
    const isLast = i === arr.length - 1;
    const color = isLast ? "#ffffff" : "rgba(255,255,255,0.40)";

    return (
      <span key={i} className={`flex items-center gap-[12px] ${isLast ? "shrink-0" : "min-w-0"}`}>
        {i > 0 && <span style={{ color: "#00FF7E", flexShrink: 0 }}>/</span>}
        {crumb.href && !isLast
          ? <Link href={crumb.href} className="truncate" style={{ color }}>{crumb.label}</Link>
          : <span style={{ color }}>{crumb.label}</span>
        }
      </span>
    );
  };

  return (
    <nav
      className="flex items-center pt-[10px] md:pt-4 mb-[30px] md:mb-[64px] min-w-0 overflow-hidden"
      style={{ fontFamily: "var(--font-almaren-nueva)", fontSize: "0.875rem", fontWeight: 21 }}
      aria-label="Breadcrumb"
      translate="no"
    >
      {/* Mobile: parent + current only */}
      <span className="flex md:hidden items-center gap-[12px] min-w-0 overflow-hidden w-full">
        {mobileCrumbs.map((crumb, i) => renderCrumb(crumb, i, mobileCrumbs))}
      </span>

      {/* Desktop: full chain */}
      <span className="hidden md:flex items-center gap-[12px]">
        {crumbs.map((crumb, i) => renderCrumb(crumb, i, crumbs))}
      </span>
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { definePlugin } from "sanity";
import { DashboardIcon } from "@sanity/icons";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: "kcmbd43u",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

type Stats = {
  thisWeek: number;
  thisMonth: number;
  total: number;
  countries: Array<{ country: string; count: number }>;
  sources: Array<{ referrer: string; count: number }>;
};

function DashboardTool() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [thisWeek, thisMonth, total, countriesRaw, sourcesRaw] = await Promise.all([
        client.fetch<number>(`count(*[_type == "contactSubmission" && submittedAt > $since])`, { since: weekAgo }),
        client.fetch<number>(`count(*[_type == "contactSubmission" && submittedAt > $since])`, { since: monthStart }),
        client.fetch<number>(`count(*[_type == "contactSubmission"])`),
        client.fetch<string[]>(`array::unique(*[_type == "contact" && defined(country)].country)`).catch(() => [] as string[]),
        client.fetch<string[]>(`array::unique(*[_type == "contact" && defined(referrer)].referrer)`).catch(() => [] as string[]),
      ]);

      const countries = await Promise.all(
        countriesRaw.map(async (country) => ({
          country,
          count: await client.fetch<number>(`count(*[_type == "contact" && country == $c])`, { c: country }),
        }))
      );

      const sources = await Promise.all(
        sourcesRaw.map(async (referrer) => ({
          referrer,
          count: await client.fetch<number>(`count(*[_type == "contact" && referrer == $r])`, { r: referrer }),
        }))
      );

      setStats({
        thisWeek,
        thisMonth,
        total,
        countries: countries.sort((a, b) => b.count - a.count),
        sources: sources.sort((a, b) => b.count - a.count),
      });
    }
    load();
  }, []);

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "20px 24px",
  };

  const label: React.CSSProperties = {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 500,
  };

  if (!stats) {
    return (
      <div style={{ padding: 32, color: "#6b7280", fontFamily: "sans-serif" }}>Loading...</div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif", maxWidth: 900 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#141127" }}>
        Enquiry overview
      </h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {[
          { label: "This week", value: stats.thisWeek },
          { label: "This month", value: stats.thisMonth },
          { label: "All time", value: stats.total },
        ].map(({ label: l, value }) => (
          <div key={l} style={{ ...card, flex: 1 }}>
            <div style={label}>{l}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#141127" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={card}>
          <div style={label}>Top countries</div>
          {stats.countries.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 14 }}>No data yet</div>
          ) : (
            stats.countries.slice(0, 8).map(({ country, count }) => (
              <div
                key={country}
                style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#374151" }}
              >
                <span>{country}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))
          )}
        </div>

        <div style={card}>
          <div style={label}>Top sources</div>
          {stats.sources.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 14 }}>No data yet</div>
          ) : (
            stats.sources.slice(0, 8).map(({ referrer, count }) => (
              <div
                key={referrer}
                style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#374151" }}
              >
                <span>{referrer}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const dashboardPlugin = definePlugin({
  name: "astgse-dashboard",
  tools: [
    {
      name: "dashboard",
      title: "Dashboard",
      icon: DashboardIcon,
      component: DashboardTool,
    },
  ],
});

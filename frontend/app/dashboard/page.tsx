"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { formatDateTime } from "@/lib/formatters";
import { getMyDashboard, type DashboardResponse } from "@/lib/dashboard";
import { getSession } from "@/lib/sessions";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    getMyDashboard()
      .then(setDashboard)
      .catch((error: any) => {
        console.error("Failed to load dashboard", error);
        showToast(error?.response?.data?.message || "Failed to load dashboard", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return <main style={pageStyle}><p style={{ color: "white" }}>Loading dashboard...</p></main>;
  }

  if (!dashboard) {
    return <main style={pageStyle}><p style={{ color: "white" }}>No dashboard data available.</p></main>;
  }

  const cards = [
    { label: "Total Rounds", value: dashboard.totalRounds },
    { label: "Completed Rounds", value: dashboard.completedRounds },
    { label: "Best Round", value: dashboard.bestRound ?? "—" },
    { label: "Average Score", value: dashboard.averageScore ?? "—" },
    { label: "Win Rate", value: `${dashboard.winRate}%` },
    { label: "Golf Groups", value: dashboard.golfGroups },
  ];

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Golf360 MVP dashboard</p>
          <h1 style={titleStyle}>Welcome back, {dashboard.fullName}</h1>
          <p style={subtitleStyle}>
            Run your weekly game, capture scores fast, track round history, and keep your golf groups active.
          </p>
        </div>
        <div style={ctaRowStyle}>
          <Link href="/rounds" style={primaryButtonStyle}>Open rounds</Link>
          <Link href="/groups" style={secondaryButtonStyle}>Manage groups</Link>
          <Link href="/courses" style={secondaryButtonStyle}>Browse courses</Link>
        </div>
      </section>

      <section style={statsGridStyle}>
        {cards.map((card) => (
          <article key={card.label} style={statCardStyle}>
            <p style={statLabelStyle}>{card.label}</p>
            <h2 style={statValueStyle}>{card.value}</h2>
          </article>
        ))}
      </section>

      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={sectionTitleStyle}>Recent rounds</h2>
          <Link href="/rounds" style={secondaryButtonStyle}>View all rounds</Link>
        </div>
        {dashboard.recentRounds.length === 0 ? (
          <div style={emptyStateStyle}>No rounds yet. Start your first 4-ball from the rounds page.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {dashboard.recentRounds.map((round) => (
              <Link key={round.id} href={`/rounds/${round.id}`} style={listCardStyle}>
                <div>
                  <h3 style={{ color: "white", margin: "0 0 6px" }}>{round.name}</h3>
                  <p style={mutedTextStyle}>
                    {round.courseName || "Course TBD"} • {round.participantCount} players • {round.format.replaceAll("_", " ")}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={mutedTextStyle}>{round.scheduledAt ? formatDateTime(round.scheduledAt) : "No tee-off set"}</p>
                  <p style={{ color: "#4ade80", fontWeight: 700, margin: 0 }}>
                    {round.leaderScore != null ? `Leader: ${round.leaderScore}` : "Scoring not started"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = { padding: "24px", maxWidth: "1200px", margin: "0 auto" };
const heroStyle: React.CSSProperties = { display: "grid", gap: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, marginBottom: 24 };
const eyebrowStyle: React.CSSProperties = { color: "#93c5fd", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, margin: "0 0 8px" };
const titleStyle: React.CSSProperties = { color: "white", fontSize: "clamp(32px, 4vw, 48px)", margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "#cbd5e1", maxWidth: 760, lineHeight: 1.6, margin: "12px 0 0" };
const ctaRowStyle: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const primaryButtonStyle: React.CSSProperties = { padding: "12px 18px", borderRadius: 14, background: "#22c55e", color: "white", fontWeight: 800, textDecoration: "none" };
const secondaryButtonStyle: React.CSSProperties = { padding: "12px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)", color: "white", fontWeight: 700, textDecoration: "none" };
const statsGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 };
const statCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 };
const statLabelStyle: React.CSSProperties = { color: "#94a3b8", margin: 0, fontWeight: 600 };
const statValueStyle: React.CSSProperties = { color: "white", fontSize: 30, margin: "8px 0 0" };
const sectionStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24 };
const sectionTitleStyle: React.CSSProperties = { color: "white", margin: 0 };
const emptyStateStyle: React.CSSProperties = { color: "#cbd5e1", padding: 24, border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 16 };
const listCardStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: 18, borderRadius: 16, background: "rgba(2, 6, 23, 0.45)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" };
const mutedTextStyle: React.CSSProperties = { color: "#cbd5e1", margin: 0 };

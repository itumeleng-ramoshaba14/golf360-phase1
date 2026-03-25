"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { completeRound, getRound, submitRoundScores, type RoundDetail } from "@/lib/rounds";
import { formatDateTime } from "@/lib/formatters";
import { getSession } from "@/lib/sessions";

export default function RoundDetailPage() {
  const params = useParams<{ roundId: string }>();
  const { showToast } = useToast();
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [selectedHole, setSelectedHole] = useState(1);
  const roundId = Array.isArray(params?.roundId) ? params?.roundId[0] : params?.roundId;

  const loadRound = async () => {
    if (!roundId) return;
    const data = await getRound(roundId);
    setRound(data);
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    loadRound()
      .catch((error: any) => {
        console.error("Failed to load round", error);
        showToast(error?.response?.data?.message || "Failed to load round", "error");
      })
      .finally(() => setLoading(false));
  }, [roundId, showToast]);

  const scoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    round?.participants.forEach((participant) => {
      participant.holeScores.forEach((score) => {
        map[`${participant.participantId}-${score.holeNumber}`] = score.strokes;
      });
    });
    return map;
  }, [round]);

  const handleScoreChange = (participantId: string, value: string) => {
    setScoreInputs((current) => ({ ...current, [participantId]: value }));
  };

  const handleSubmitHoleScores = async () => {
    if (!roundId || !round) return;

    const entries = round.participants
      .map((participant) => {
        const raw = scoreInputs[participant.participantId];
        if (!raw) return null;
        return {
          participantId: participant.participantId,
          holeNumber: selectedHole,
          strokes: Number(raw),
        };
      })
      .filter((entry): entry is { participantId: string; holeNumber: number; strokes: number } => !!entry && Number.isFinite(entry.strokes));

    if (entries.length === 0) {
      showToast("Enter at least one score before saving.", "error");
      return;
    }

    try {
      const updated = await submitRoundScores(roundId, entries);
      setRound(updated);
      setScoreInputs({});
      showToast(`Hole ${selectedHole} scores saved`, "success");
    } catch (error: any) {
      console.error("Failed to submit scores", error);
      showToast(error?.response?.data?.message || "Failed to save scores", "error");
    }
  };

  const handleCompleteRound = async () => {
    if (!roundId) return;
    try {
      const updated = await completeRound(roundId);
      setRound(updated);
      showToast("Round marked as completed", "success");
    } catch (error: any) {
      console.error("Failed to complete round", error);
      showToast(error?.response?.data?.message || "Failed to complete round", "error");
    }
  };

  if (loading) {
    return <main style={pageStyle}><p style={{ color: "white" }}>Loading round...</p></main>;
  }

  if (!round) {
    return <main style={pageStyle}><p style={{ color: "white" }}>Round not found.</p></main>;
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>{round.status} • {round.format.replaceAll("_", " ")}</p>
          <h1 style={titleStyle}>{round.name}</h1>
          <p style={subtitleStyle}>{round.courseName || "Course TBD"} • {round.groupName || "Independent game"} • {round.scheduledAt ? formatDateTime(round.scheduledAt) : "Schedule not set"}</p>
        </div>
        <div style={leaderCardStyle}>
          <p style={{ color: "#93c5fd", margin: 0, fontWeight: 700 }}>Leader</p>
          <h2 style={{ color: "white", margin: "8px 0 4px" }}>{round.leader?.displayName || "No scores yet"}</h2>
          <p style={{ color: "#cbd5e1", margin: 0 }}>{round.leader?.totalStrokes != null ? `${round.leader.totalStrokes} strokes` : "Start entering hole scores"}</p>
          {round.status !== "COMPLETED" && (
            <button style={{ ...primaryButtonStyle, marginTop: 16 }} onClick={handleCompleteRound}>Complete round</button>
          )}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h2 style={sectionTitleStyle}>Fast score entry</h2>
            <p style={subtitleStyle}>Enter the whole group’s score for one hole at a time.</p>
          </div>
          <select style={selectStyle} value={selectedHole} onChange={(e) => setSelectedHole(Number(e.target.value))}>
            {Array.from({ length: 18 }, (_, index) => index + 1).map((hole) => <option key={hole} value={hole}>Hole {hole}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {round.participants.map((participant) => {
            const existing = scoreMap[`${participant.participantId}-${selectedHole}`];
            return (
              <div key={participant.participantId} style={rowStyle}>
                <div>
                  <strong style={{ color: "white" }}>{participant.position}. {participant.displayName}</strong>
                  <p style={{ color: "#cbd5e1", margin: "6px 0 0" }}>
                    Total: {participant.totalStrokes ?? "—"} • Holes played: {participant.holesPlayed}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={existingBadgeStyle}>{existing ? `Existing: ${existing}` : "No score yet"}</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={scoreInputs[participant.participantId] ?? ""}
                    onChange={(e) => handleScoreChange(participant.participantId, e.target.value)}
                    style={scoreInputStyle}
                    placeholder="Strokes"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {round.status !== "COMPLETED" && (
          <button style={{ ...primaryButtonStyle, marginTop: 20 }} onClick={handleSubmitHoleScores}>Save hole scores</button>
        )}
      </section>

      <section style={{ ...panelStyle, marginTop: 24 }}>
        <h2 style={sectionTitleStyle}>Leaderboard</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {round.participants.map((participant) => (
            <div key={`${participant.participantId}-leaderboard`} style={leaderboardRowStyle}>
              <div>
                <strong style={{ color: "white" }}>#{participant.position} {participant.displayName}</strong>
                <p style={{ color: "#cbd5e1", margin: "6px 0 0" }}>{participant.holeScores.length} hole scores recorded</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ color: "#4ade80", fontSize: 22 }}>{participant.totalStrokes ?? "—"}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = { padding: 24, maxWidth: 1200, margin: "0 auto" };
const heroStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 20, alignItems: "start", marginBottom: 24 };
const eyebrowStyle: React.CSSProperties = { color: "#93c5fd", textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 700, margin: 0 };
const titleStyle: React.CSSProperties = { color: "white", fontSize: 40, margin: "8px 0 0" };
const subtitleStyle: React.CSSProperties = { color: "#cbd5e1", lineHeight: 1.6, margin: "8px 0 0" };
const leaderCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 20 };
const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24 };
const sectionTitleStyle: React.CSSProperties = { color: "white", marginTop: 0 };
const selectStyle: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, background: "rgba(2,6,23,0.45)", color: "white", border: "1px solid rgba(255,255,255,0.12)" };
const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(2,6,23,0.35)", flexWrap: "wrap" };
const existingBadgeStyle: React.CSSProperties = { color: "#cbd5e1", minWidth: 110, textAlign: "right" };
const scoreInputStyle: React.CSSProperties = { width: 100, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(2,6,23,0.45)", color: "white" };
const primaryButtonStyle: React.CSSProperties = { padding: "14px 18px", borderRadius: 14, border: "none", background: "#22c55e", color: "white", fontWeight: 800, cursor: "pointer" };
const leaderboardRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(2,6,23,0.35)" };

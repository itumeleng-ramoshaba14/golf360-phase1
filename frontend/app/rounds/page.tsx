"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { getMyGroups, type GolfGroup } from "@/lib/groups";
import { api } from "@/lib/api";
import { createRound, getMyRounds, type GameFormat, type RoundSummary } from "@/lib/rounds";
import { formatDateTime } from "@/lib/formatters";
import { getSession } from "@/lib/sessions";

type Course = { id: string; name: string };
type UserOption = { id: string; fullName: string; email: string; handicap?: number | null };

const FORMATS: GameFormat[] = [
  "STROKE_PLAY",
  "STABLEFORD",
  "BETTER_BALL",
  "MATCH_PLAY",
  "SOCIAL_4BALL",
];

export default function RoundsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const bookingIdFromQuery = searchParams.get("bookingId") || "";
  const courseIdFromQuery = searchParams.get("courseId") || "";
  const scheduledAtFromQuery = searchParams.get("scheduledAt") || "";
  const courseNameFromQuery = searchParams.get("courseName") || "";
  const guestNamesFromQuery = searchParams.get("guestNames") || "";

  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [groups, setGroups] = useState<GolfGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [players, setPlayers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestNames, setGuestNames] = useState(guestNamesFromQuery);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: bookingIdFromQuery ? `Round for Booking ${bookingIdFromQuery.slice(0, 8)}` : "Saturday Fourball",
    courseId: courseIdFromQuery,
    groupId: "",
    scheduledAt: scheduledAtFromQuery ? scheduledAtFromQuery.slice(0, 16) : "",
    format: "SOCIAL_4BALL" as GameFormat,
  });

  const loadData = async () => {
    const [roundData, groupData, courseData, profileData] = await Promise.all([
      getMyRounds(),
      getMyGroups(),
      api.get("/courses"),
      api.get("/profile/me"),
    ]);

    setRounds(roundData);
    setGroups(groupData);
    setCourses(courseData.data);

    const me = profileData.data;
    const groupedPlayers = Array.from(
      new Map(
        groupData
          .flatMap((group) => group.members)
          .map((member) => [
            member.userId,
            {
              id: member.userId,
              fullName: member.fullName,
              email: member.email,
              handicap: member.handicap,
            },
          ])
      ).values()
    ).filter((player) => player.id !== me.id);

    setPlayers(groupedPlayers);
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    loadData()
      .catch((error: any) => {
        console.error("Failed to load rounds", error);
        showToast(error?.response?.data?.message || "Failed to load rounds", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!form.groupId) return;

    const selectedGroup = groups.find((group) => group.id === form.groupId);
    if (!selectedGroup) return;

    const memberIds = selectedGroup.members.map((member) => member.userId);
    setSelectedPlayerIds(memberIds);
  }, [form.groupId, groups]);

  const availablePlayers = useMemo(() => {
    if (!form.groupId) {
      return [...players].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    const selectedGroup = groups.find((group) => group.id === form.groupId);
    if (!selectedGroup) {
      return [...players].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return selectedGroup.members
      .map((member) => ({
        id: member.userId,
        fullName: member.fullName,
        email: member.email,
        handicap: member.handicap,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [form.groupId, groups, players]);

  const selectedCourseName =
    courses.find((course) => course.id === form.courseId)?.name || courseNameFromQuery;

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const created = await createRound({
        ...form,
        courseId: form.courseId || undefined,
        groupId: form.groupId || undefined,
        scheduledAt: form.scheduledAt || undefined,
        participantUserIds: selectedPlayerIds,
        guestNames: guestNames
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean),
      });

      setGuestNames("");
      setSelectedPlayerIds([]);
      setForm({
        name: "Saturday Fourball",
        courseId: "",
        groupId: "",
        scheduledAt: "",
        format: "SOCIAL_4BALL",
      });

      showToast("Round created successfully", "success");
      window.location.href = `/rounds/${created.id}`;
    } catch (error: any) {
      console.error("Failed to create round", error);
      showToast(error?.response?.data?.message || "Failed to create round", "error");
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "white" }}>Loading rounds...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Rounds</h1>
        <p style={subtitleStyle}>
          Create a golf round, add players, capture scores, and track performance over time.
        </p>
      </header>

      <section style={gridStyle}>
        <div style={panelStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>Create round</h2>
            {bookingIdFromQuery && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.35)",
                  color: "white",
                }}
              >
                Prefilled from booking <strong>{bookingIdFromQuery}</strong>
                {selectedCourseName ? (
                  <>
                    {" "}
                    • <strong>{selectedCourseName}</strong>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <form onSubmit={handleCreate} style={{ display: "grid", gap: 14 }}>
            <div>
              <p style={labelStyle}>Round name</p>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Saturday Fourball"
              />
            </div>

            <div>
              <p style={labelStyle}>Course</p>
              <select
                style={inputStyle}
                value={form.courseId}
                onChange={(e) => setForm((current) => ({ ...current, courseId: e.target.value }))}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p style={labelStyle}>Group (optional)</p>
              <select
                style={inputStyle}
                value={form.groupId}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    groupId: e.target.value,
                  }))
                }
              >
                <option value="">No group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p style={labelStyle}>Scheduled time</p>
              <input
                type="datetime-local"
                style={inputStyle}
                value={form.scheduledAt}
                onChange={(e) => setForm((current) => ({ ...current, scheduledAt: e.target.value }))}
              />
            </div>

            <div>
              <p style={labelStyle}>Format</p>
              <select
                style={inputStyle}
                value={form.format}
                onChange={(e) =>
                  setForm((current) => ({ ...current, format: e.target.value as GameFormat }))
                }
              >
                {FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p style={labelStyle}>Add registered players</p>
              <div style={chipWrapStyle}>
                {availablePlayers.length === 0 ? (
                  <div style={emptyStateStyle}>No group members available yet.</div>
                ) : (
                  availablePlayers.map((player) => (
                    <button
                      type="button"
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      style={{
                        ...chipStyle,
                        background: selectedPlayerIds.includes(player.id)
                          ? "rgba(34,197,94,0.18)"
                          : "rgba(255,255,255,0.05)",
                        borderColor: selectedPlayerIds.includes(player.id)
                          ? "#22c55e"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      {player.fullName}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p style={labelStyle}>Guest players</p>
              <textarea
                style={{ ...inputStyle, minHeight: 96 }}
                placeholder="Guest names, separated by commas"
                value={guestNames}
                onChange={(e) => setGuestNames(e.target.value)}
              />
            </div>

            <button style={primaryButtonStyle} type="submit">
              Create round
            </button>
          </form>
        </div>

        <div style={panelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={sectionTitleStyle}>Round history</h2>
            <span style={pillStyle}>{rounds.length} rounds</span>
          </div>

          {rounds.length === 0 ? (
            <div style={emptyStateStyle}>No rounds yet. Create one to start scoring.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {rounds.map((round) => (
                <Link key={round.id} href={`/rounds/${round.id}`} style={listCardStyle}>
                  <div>
                    <strong style={{ color: "white", display: "block" }}>{round.name}</strong>
                    <span style={{ color: "#cbd5e1" }}>
                      {round.courseName || "Course TBD"} • {round.participantCount} players
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={pillStyle}>{round.status}</div>
                    <p style={{ color: "#cbd5e1", margin: "8px 0 0" }}>
                      {round.scheduledAt ? formatDateTime(round.scheduledAt) : "Schedule not set"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = { padding: 24, maxWidth: 1280, margin: "0 auto" };
const headerStyle: React.CSSProperties = { marginBottom: 24 };
const titleStyle: React.CSSProperties = { color: "white", fontSize: 42, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "#cbd5e1", lineHeight: 1.6, margin: "8px 0 0" };
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};
const panelStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 24,
};
const sectionTitleStyle: React.CSSProperties = { color: "white", marginTop: 0 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(2,6,23,0.45)",
  color: "white",
  boxSizing: "border-box",
};
const primaryButtonStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
const labelStyle: React.CSSProperties = { color: "white", fontWeight: 700, margin: "0 0 10px" };
const chipWrapStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10 };
const chipStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  cursor: "pointer",
};
const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontWeight: 700,
  fontSize: 12,
};
const emptyStateStyle: React.CSSProperties = {
  color: "#cbd5e1",
  padding: 18,
  borderRadius: 16,
  border: "1px dashed rgba(255,255,255,0.15)",
};
const listCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(2,6,23,0.35)",
  textDecoration: "none",
};
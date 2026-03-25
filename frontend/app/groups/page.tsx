"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { addGroupMember, createGroup, getMyGroups, type GolfGroup } from "@/lib/groups";
import { getSession } from "@/lib/sessions";

export default function GroupsPage() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<GolfGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [form, setForm] = useState({ name: "", description: "", scheduleLabel: "", homeCourseName: "" });

  const loadGroups = async () => {
    const data = await getMyGroups();
    setGroups(data);
    if (!selectedGroupId && data.length > 0) {
      setSelectedGroupId(data[0].id);
    }
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    loadGroups()
      .catch((error: any) => {
        console.error("Failed to load groups", error);
        showToast(error?.response?.data?.message || "Failed to load groups", "error");
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup(form);
      setForm({ name: "", description: "", scheduleLabel: "", homeCourseName: "" });
      showToast("Group created successfully", "success");
      await loadGroups();
    } catch (error: any) {
      console.error("Failed to create group", error);
      showToast(error?.response?.data?.message || "Failed to create group", "error");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      await addGroupMember(selectedGroup.id, inviteEmail);
      setInviteEmail("");
      showToast("Member added to the group", "success");
      await loadGroups();
    } catch (error: any) {
      console.error("Failed to add member", error);
      showToast(error?.response?.data?.message || "Failed to add member", "error");
    }
  };

  if (loading) {
    return <main style={pageStyle}><p style={{ color: "white" }}>Loading groups...</p></main>;
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Golf groups</h1>
          <p style={subtitleStyle}>Build the recurring Saturday and society groups that keep golfers coming back every week.</p>
        </div>
      </div>

      <section style={gridStyle}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Create group</h2>
          <form onSubmit={handleCreate} style={{ display: "grid", gap: 12 }}>
            <input style={inputStyle} placeholder="Group name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input style={inputStyle} placeholder="Weekly schedule (e.g. Saturdays 07:40)" value={form.scheduleLabel} onChange={(e) => setForm((prev) => ({ ...prev, scheduleLabel: e.target.value }))} />
            <input style={inputStyle} placeholder="Home course" value={form.homeCourseName} onChange={(e) => setForm((prev) => ({ ...prev, homeCourseName: e.target.value }))} />
            <textarea style={{ ...inputStyle, minHeight: 120 }} placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <button style={primaryButtonStyle} type="submit">Create group</button>
          </form>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>My groups</h2>
          {groups.length === 0 ? (
            <div style={emptyStateStyle}>No golf groups yet. Create one and start inviting your regular 4-ball.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  style={{
                    ...groupButtonStyle,
                    borderColor: selectedGroup?.id === group.id ? "#22c55e" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <strong style={{ color: "white", display: "block", marginBottom: 6 }}>{group.name}</strong>
                  <span style={{ color: "#cbd5e1" }}>{group.memberCount} members • {group.scheduleLabel || "Schedule flexible"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedGroup && (
        <section style={{ ...panelStyle, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <h2 style={sectionTitleStyle}>{selectedGroup.name}</h2>
              <p style={subtitleStyle}>{selectedGroup.description || "No description yet."}</p>
              <p style={{ ...subtitleStyle, marginTop: 8 }}>
                {selectedGroup.homeCourseName || "No home course"} • {selectedGroup.scheduleLabel || "No schedule set"}
              </p>
            </div>
          </div>

          <form onSubmit={handleInvite} style={{ display: "flex", gap: 12, margin: "20px 0 24px", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 260 }} placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <button style={primaryButtonStyle} type="submit">Add member</button>
          </form>

          <div style={{ display: "grid", gap: 10 }}>
            {selectedGroup.members.map((member) => (
              <div key={`${selectedGroup.id}-${member.email}`} style={memberCardStyle}>
                <div>
                  <strong style={{ color: "white" }}>{member.fullName}</strong>
                  <p style={{ color: "#cbd5e1", margin: "6px 0 0" }}>{member.email}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={badgeStyle}>{member.role}</span>
                  <p style={{ color: "#cbd5e1", margin: "8px 0 0" }}>Handicap: {member.handicap ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle: React.CSSProperties = { padding: 24, maxWidth: 1200, margin: "0 auto" };
const headerStyle: React.CSSProperties = { marginBottom: 24 };
const titleStyle: React.CSSProperties = { color: "white", fontSize: 42, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: "#cbd5e1", margin: "8px 0 0", lineHeight: 1.6 };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 };
const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24 };
const sectionTitleStyle: React.CSSProperties = { color: "white", marginTop: 0 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(2,6,23,0.45)", color: "white", boxSizing: "border-box" };
const primaryButtonStyle: React.CSSProperties = { padding: "14px 18px", borderRadius: 14, border: "none", background: "#22c55e", color: "white", fontWeight: 800, cursor: "pointer" };
const emptyStateStyle: React.CSSProperties = { color: "#cbd5e1", padding: 18, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.15)" };
const groupButtonStyle: React.CSSProperties = { textAlign: "left", padding: 16, background: "rgba(2,6,23,0.4)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" };
const memberCardStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(2,6,23,0.35)" };
const badgeStyle: React.CSSProperties = { display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "rgba(34,197,94,0.2)", color: "#86efac", fontWeight: 700, fontSize: 12 };

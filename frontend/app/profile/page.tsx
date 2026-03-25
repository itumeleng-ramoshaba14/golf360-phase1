"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile, UserProfileResponse } from "@/lib/profile";
import { updateStoredUserProfile } from "@/lib/sessions";
import { useToast } from "@/components/ToastProvider";

export default function ProfilePage() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [handicap, setHandicap] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFullName(data.fullName ?? "");
      setPhoneNumber(data.phoneNumber ?? "");
      setHandicap(
        data.handicap === null || data.handicap === undefined
          ? ""
          : String(data.handicap)
      );
      setHomeClub(data.homeClub ?? "");
      setProfileImageUrl(data.profileImageUrl ?? "");
    } catch (error: any) {
      console.error("Failed to load profile", error);
      showToast(error?.response?.data?.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const updated = await updateMyProfile({
        fullName,
        phoneNumber,
        handicap: handicap === "" ? null : Number(handicap),
        homeClub,
        profileImageUrl,
      });

      setProfile(updated);
      updateStoredUserProfile({
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
      });

      showToast("Profile updated successfully", "success");
    } catch (error: any) {
      console.error("Failed to update profile", error);
      showToast(error?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "24px", color: "white" }}>
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", color: "white" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
        My Profile
      </h1>
      <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
        Manage your golfer profile and preferences.
      </p>

      <div
        style={{
          border: "1px solid #2a3a5a",
          borderRadius: "16px",
          padding: "24px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <form onSubmit={handleSave} style={{ display: "grid", gap: "18px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Email
            </label>
            <input
              value={profile?.email ?? ""}
              disabled
              style={{ ...inputStyle, opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Phone Number
            </label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={inputStyle}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Handicap
            </label>
            <input
              type="number"
              step="0.1"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              style={inputStyle}
              placeholder="e.g. 12.4"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Home Club
            </label>
            <input
              value={homeClub}
              onChange={(e) => setHomeClub(e.target.value)}
              style={inputStyle}
              placeholder="Enter your home club"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Profile Image URL
            </label>
            <input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              style={inputStyle}
              placeholder="Paste image URL"
            />
          </div>

          {profileImageUrl && (
            <div>
              <p style={{ marginBottom: "8px", fontWeight: 600 }}>Preview</p>
              <img
                src={profileImageUrl}
                alt="Profile preview"
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid #2a3a5a",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#111",
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              width: "fit-content",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clearSession, getCurrentUser, getSession } from "@/lib/sessions";

type StoredUser = {
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, isAdmin: false };
  }

  const session = getSession();
  const user = getCurrentUser() as StoredUser | null;

  const role = (session?.role || user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  return {
    isLoggedIn: !!session,
    isAdmin,
  };
}

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAuthState = () => {
    const auth = getStoredAuth();
    setIsLoggedIn(auth.isLoggedIn);
    setIsAdmin(auth.isAdmin);
  };

  useEffect(() => {
    refreshAuthState();
  }, [pathname]);

  useEffect(() => {
    const handleStorage = () => refreshAuthState();
    const handleSession = () => refreshAuthState();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("golf360-session-changed", handleSession);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("golf360-session-changed", handleSession);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const linkStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    padding: "14px 24px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 700,
    display: "inline-block",
  };

  return (
    <nav
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 40px",
        background: "rgba(0, 0, 0, 0.35)",
        boxSizing: "border-box",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/courses"
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: 800,
            textDecoration: "none",
            marginRight: "18px",
          }}
        >
          Golf360
        </Link>

        <Link href="/courses" style={linkStyle}>
          Courses
        </Link>

        {isLoggedIn && (
          <>
            <Link href="/dashboard" style={linkStyle}>
              Dashboard
            </Link>

            <Link href="/rounds" style={linkStyle}>
              Rounds
            </Link>

            <Link href="/groups" style={linkStyle}>
              Groups
            </Link>

            <Link href="/bookings" style={linkStyle}>
              My Bookings
            </Link>

            <Link href="/profile" style={linkStyle}>
              Profile
            </Link>
          </>
        )}

        {isLoggedIn && isAdmin && (
          <Link href="/admin" style={linkStyle}>
            Admin
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!isLoggedIn ? (
          <>
            <Link href="/login" style={linkStyle}>
              Login
            </Link>
            <Link href="/register" style={linkStyle}>
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              color: "white",
              background: "transparent",
              padding: "14px 24px",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
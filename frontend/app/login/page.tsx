"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/sessions";

type LoginResponse = {
  userId: string;
  token: string;
  fullName: string;
  email: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("player@golf360.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      saveSession({
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        token: data.token,
      });

      router.push("/courses");
      router.refresh();
    } catch (err: any) {
      console.error("Login failed:", err?.response || err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src="/golf360-header.png"
            alt="Golf360 Header"
            width={520}
            height={260}
            priority
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        <div
          style={{
            background: "#0a1f52",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
            padding: "36px",
            color: "white",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <h1 style={{ fontSize: "56px", margin: "0 0 18px 0" }}>Login</h1>
          <p
            style={{
              fontSize: "18px",
              color: "#c8d4f0",
              marginBottom: "28px",
              lineHeight: 1.5,
            }}
          >
            Sign in to browse courses, book tee times, manage your reservations, and access your golf dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "16px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "18px 20px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#02123d",
                color: "white",
                fontSize: "16px",
                marginBottom: "22px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", marginBottom: "10px", fontSize: "16px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "18px 20px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#02123d",
                color: "white",
                fontSize: "16px",
                marginBottom: "22px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p
                style={{
                  color: "#fca5a5",
                  marginTop: "-8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "18px",
                border: "none",
                background: "#22c55e",
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "24px",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ margin: 0, fontSize: "16px" }}>
            Don’t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "white", fontWeight: 700, textDecoration: "none" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "../../lib/api";
import { saveSession } from "../../lib/sessions";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  token?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post<RegisterResponse>("/auth/register", {
        fullName,
        email,
        password,
        role,
      });

      saveSession(response.data);
      setMessage(`Welcome to Golf360, ${response.data.fullName}`);
      setTimeout(() => {
        router.push("/courses");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel auth-panel">
      <h1>Create Account</h1>
      <p className="muted">
        Register to start booking tee times and managing your golf reservations.
      </p>

      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>

        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="PLAYER">Player</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <p style={{ marginTop: 18 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ fontWeight: 700 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
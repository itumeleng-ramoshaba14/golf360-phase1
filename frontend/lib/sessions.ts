export type SessionData = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  token?: string;
};

const SESSION_KEY = "golf360_session";
const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveSession(session: SessionData) {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (session.token) {
    localStorage.setItem(TOKEN_KEY, session.token);
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: session.userId,
      fullName: session.fullName,
      email: session.email,
      role: session.role,
    })
  );

  window.dispatchEvent(new Event("golf360-session-changed"));
}

export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("golf360-session-changed"));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function updateStoredUserProfile(profile: {
  fullName: string;
  email: string;
  role: string;
}) {
  if (typeof window === "undefined") return;

  const existingUserRaw = localStorage.getItem(USER_KEY);
  const existingSessionRaw = localStorage.getItem(SESSION_KEY);

  if (existingUserRaw) {
    try {
      const existingUser = JSON.parse(existingUserRaw);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          ...existingUser,
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role,
        })
      );
    } catch {}
  }

  if (existingSessionRaw) {
    try {
      const existingSession = JSON.parse(existingSessionRaw);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...existingSession,
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role,
        })
      );
    } catch {}
  }

  window.dispatchEvent(new Event("golf360-session-changed"));
}
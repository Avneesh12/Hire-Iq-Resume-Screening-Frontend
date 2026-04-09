import type { User } from "./types";

const TOKEN_KEY = "hireiq_token";
const USER_KEY = "hireiq_user";
const COOKIE_NAME = "hireiq_token";

/** Set a cookie so the Next.js middleware can also read the token server-side */
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const TokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(COOKIE_NAME, token);
  },
  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
    clearCookie(COOKIE_NAME);
  },
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookie(COOKIE_NAME);
  },
  isAuthenticated(): boolean {
    return Boolean(this.get());
  },
};

export function authHeaders(): Record<string, string> {
  const token = TokenStorage.get();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function authHeadersMultipart(): Record<string, string> {
  const token = TokenStorage.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

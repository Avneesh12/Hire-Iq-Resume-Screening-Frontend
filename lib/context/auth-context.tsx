"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { TokenStorage } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = TokenStorage.get();
    const savedUser = TokenStorage.getUser();

    if (token && savedUser) {
      // Optimistically show the saved user immediately
      setUser(savedUser);
      setIsLoading(false);

      // Verify token is still valid by calling /me in the background
      authApi.me().then((freshUser) => {
        TokenStorage.setUser(freshUser);
        setUser(freshUser);
      }).catch(() => {
        // Token is invalid — clear everything and redirect
        TokenStorage.clear();
        setUser(null);
        router.push(ROUTES.login);
      });
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAuth = useCallback((newUser: User, token: string) => {
    TokenStorage.set(token);
    TokenStorage.setUser(newUser);
    setUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authApi.me();
      TokenStorage.setUser(freshUser);
      setUser(freshUser);
    } catch {
      // Ignore silent refresh failures
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Always clear local state even if the API call fails
    } finally {
      TokenStorage.clear();
      setUser(null);
      router.push(ROUTES.login);
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        setAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

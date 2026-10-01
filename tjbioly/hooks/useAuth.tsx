"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { NavUser } from "@/lib/nav-session";

export type User = {
  id: number;
  ionId: string;
  name: string | null;
  username: string | null;
  classYear: string | null;
  roles: string[];
  pfpUrl: string | null;
  bio: string | null;
};

type AuthState = { loading: boolean; authenticated: boolean; user: User | null };
const AuthContext = createContext<AuthState>({ loading: true, authenticated: false, user: null });

function initialUser(hint: NavUser | null): User | null {
  return hint ? { id: hint.id, ionId: "", name: hint.name, username: null, classYear: null, roles: hint.roles, pfpUrl: null, bio: null } : null;
}

export function AuthProvider({ initialNavUser, children }: { initialNavUser: NavUser | null; children: React.ReactNode }) {
  const [loading, setLoading] = useState(!initialNavUser);
  const [authenticated, setAuthenticated] = useState(!!initialNavUser);
  const [user, setUser] = useState<User | null>(() => initialUser(initialNavUser));

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(data.authenticated);
          setUser(data.user || null);
        } else if (res.status === 401) {
          setAuthenticated(false);
          setUser(null);
        }
      } catch {
        // Keep the server-provided navbar hint through a transient network error.
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return <AuthContext.Provider value={{ loading, authenticated, user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

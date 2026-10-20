import { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, try to restore session via the refresh cookie + /me/
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const refreshRes = await api.post("/auth/refresh/");
        const { access } = refreshRes.data;
        setAccessToken(access);

        const meRes = await api.get("/auth/me/");
        if (!cancelled) setUser(meRes.data);
      } catch {
        // No valid session — that's fine, user stays null
        setAccessToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login/", { email, password });
    setAccessToken(res.data.access);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register({ email, first_name, last_name, password }) {
    await api.post("/auth/register/", { email, first_name, last_name, password });
    // Auto-login after successful registration
    return login(email, password);
  }

  async function logout() {
    try {
      await api.post("/auth/logout/");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vg_token");
    const cached = localStorage.getItem("vg_user");
    if (token && cached) {
      try { setUser(JSON.parse(cached)); } catch { /* noop */ }
    }
    setReady(true);
  }, []);

  const login = async (username, password) => {
    const { data } = await http.post("/auth/login", { username, password });
    localStorage.setItem("vg_token", data.access_token);
    localStorage.setItem("vg_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("vg_token");
    localStorage.removeItem("vg_user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

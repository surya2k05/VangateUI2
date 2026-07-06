import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/api";

const AuthCtx = createContext(null);

const DEFAULT_USER = { username: "admin", role: "Admin", full_name: "Ada Admin" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    setReady(true);
  }, []);

  const login = async (username, password) => {
    return DEFAULT_USER;
  };

  const logout = () => {
    // No-op or keep user
  };

  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

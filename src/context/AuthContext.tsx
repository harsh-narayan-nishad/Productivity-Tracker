import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthState, getAuth, setAuth } from "@/lib/storage";

type AuthContextType = {
  user: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthState>(getAuth());

  const value = useMemo<AuthContextType>(() => ({
    user,
    login: async (email, password) => {
      // Simple default creds as specified
      const ok = email.trim() === "harsh@gmail.com" && password === "123";
      if (ok) {
        const auth = { email };
        setUser(auth);
        setAuth(auth);
        return true;
      }
      return false;
    },
    logout: () => {
      setUser(null);
      setAuth(null);
    },
  }), [user]);

  useEffect(() => {
    setUser(getAuth());
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

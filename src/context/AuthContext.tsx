import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // safe parse only if exists
    }
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);


  // ✅ LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
    } catch (error: any) {
      throw new Error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGNUP FUNCTION
  const signup = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // optional: auto-login after signup
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

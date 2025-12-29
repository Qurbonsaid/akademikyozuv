"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface DataContextType {
  // Auth
  isAdmin: boolean;
  token: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setAuthFromToken: (token: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAdmin(true);
    }
  }, []);

  // Auth functions
  const login = useCallback((email: string, password: string) => {
    // This is called after successful API login for backward compatibility
    setIsAdmin(true);
    return true;
  }, []);

  const setAuthFromToken = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAdmin(false);
  }, []);

  return (
    <DataContext.Provider
      value={{
        isAdmin,
        token,
        login,
        logout,
        setAuthFromToken,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to shuffle an array (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

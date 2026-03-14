"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type AdminContextType = {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  loading: boolean;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  loading: true,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  useEffect(() => {
    const supabase = createClient();
    
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!session);
        }
      } catch (err) {
        console.error("Unexpected session check error:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth change event:", event);
      setIsAdmin(!!session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isEditMode, toggleEditMode, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);

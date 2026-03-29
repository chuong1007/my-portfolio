"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

type GlobalModalState = {
  isOpen: boolean;
  sectionId: string;
  initialData: Record<string, any>;
} | null;

type AdminContextType = {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  loading: boolean;
  globalPreviewMode: PreviewMode;
  setGlobalPreviewMode: (mode: PreviewMode) => void;
  modalState: GlobalModalState;
  openEditor: (sectionId: string, initialData: any) => void;
  closeEditor: () => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  loading: true,
  globalPreviewMode: 'desktop',
  setGlobalPreviewMode: () => {},
  modalState: null,
  openEditor: () => {},
  closeEditor: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true); // Default to true initially
  const [loading, setLoading] = useState(true);
  const [globalPreviewMode, setGlobalPreviewMode] = useState<PreviewMode>('desktop');
  const [modalState, setModalState] = useState<GlobalModalState>(null);

  // Initialize from localStorage and URL on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_edit_mode');
    if (saved !== null) {
      setIsEditMode(saved === 'true');
    }

    // If inside an iframe, sync preview mode from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('iframe') === '1') {
      const mode = params.get('mode') as PreviewMode;
      if (mode) setGlobalPreviewMode(mode);
    }
  }, []);

  const toggleEditMode = () => {
    setIsEditMode(prev => {
      const next = !prev;
      localStorage.setItem('admin_edit_mode', next.toString());
      return next;
    });
  };

  const openEditor = (sectionId: string, initialData: any) => {
    setModalState({ isOpen: true, sectionId, initialData });
  };

  const closeEditor = () => {
    setModalState(null);
  };

  // Listen for messages from iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: You might want to check event.origin here if needed
      if (event.data?.type === 'OPEN_ADMIN_MODAL') {
        setModalState({
          isOpen: true,
          sectionId: event.data.sectionId,
          initialData: event.data.data
        });
      } else if (event.data?.type === 'NAVIGATE_TO') {
        window.location.href = event.data.url;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    <AdminContext.Provider value={{ 
      isAdmin, 
      isEditMode, 
      toggleEditMode, 
      loading, 
      globalPreviewMode, 
      setGlobalPreviewMode,
      modalState,
      openEditor,
      closeEditor
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined || context === null) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

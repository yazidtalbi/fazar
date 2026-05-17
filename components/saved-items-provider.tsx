"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

interface SavedItemsContextType {
  savedItems: any[];
  isLoading: boolean;
  refreshSavedItems: () => Promise<void>;
  isProductSaved: (productId: string) => boolean;
}

const SavedItemsContext = createContext<SavedItemsContextType | null>(null);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const lastFetchedRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchSavedItems = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;

    // Only fetch if forced or if it's been more than 30 seconds since last fetch
    const now = Date.now();
    if (!force && now - lastFetchedRef.current < 30000) {
      return;
    }

    isFetchingRef.current = true;
    try {
      const response = await fetch("/api/saved");
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.savedItems || []);
        lastFetchedRef.current = now;
      }
    } catch (error) {
      console.error("Error fetching saved items:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const refreshSavedItems = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      await fetchSavedItems(true);
    }
  }, [user, fetchSavedItems]);

  // Check if user is authenticated and listen for auth changes
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function checkUser() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        if (currentUser) {
          fetchSavedItems();
        } else {
          setSavedItems([]);
          setIsLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              fetchSavedItems(true);
            } else {
              setUser(null);
              setSavedItems([]);
              setIsLoading(false);
            }
          }
        );
        subscription = authSubscription;
      } catch (error) {
        console.error("Error checking user:", error);
        setIsLoading(false);
      }
    }
    
    checkUser();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchSavedItems]);

  // Supabase Realtime subscription for saved items
  useEffect(() => {
    if (!user) return;

    let channel: any = null;

    async function setupRealtime() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      channel = supabase
        .channel('saved-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'saved_items',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchSavedItems(true);
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel) {
        const { createClient } = require("@/lib/supabase/client");
        createClient().removeChannel(channel);
      }
    };
  }, [user, fetchSavedItems]);

  const isProductSaved = (productId: string) => {
    return savedItems.some((item: any) => item.product_id === productId);
  };

  return (
    <SavedItemsContext.Provider
      value={{
        savedItems,
        isLoading,
        refreshSavedItems,
        isProductSaved,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems(): SavedItemsContextType {
  const context = useContext(SavedItemsContext);
  if (!context) {
    // Return a fallback if used outside provider
    return {
      savedItems: [],
      isLoading: false,
      refreshSavedItems: async () => {},
      isProductSaved: () => false,
    };
  }
  return context;
}


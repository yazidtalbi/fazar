"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

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

  const fetchSavedItems = useCallback(async () => {
    try {
      const response = await fetch("/api/saved");
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.savedItems || []);
      }
    } catch (error) {
      console.error("Error fetching saved items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSavedItems = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      await fetchSavedItems();
    }
  }, [user, fetchSavedItems]);

  // Check if user is authenticated and listen for auth changes
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function checkUser() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await fetchSavedItems();
        } else {
          setSavedItems([]);
          setIsLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              await fetchSavedItems();
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


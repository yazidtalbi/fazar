"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchedRef = useRef(0);
  const isFetchingRef = useRef(false);
  const [hasAuthError, setHasAuthError] = useState(false);

  const fetchNotifications = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;
    if (hasAuthError && !force) return;

    // Only fetch if forced or if it's been more than 30 seconds since last fetch
    const now = Date.now();
    if (!force && now - lastFetchedRef.current < 30000) {
      return;
    }

    isFetchingRef.current = true;
    try {
      const response = await fetch("/api/notifications?unread=false");
      
      if (response.status === 401) {
        setHasAuthError(true);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        setHasAuthError(false);
        const data = await response.json();
        const fetchedNotifications = data.notifications || [];
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.is_read).length);
        lastFetchedRef.current = now;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasAuthError]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  useEffect(() => {
    if (hasAuthError) return;

    fetchNotifications();
    
    // Also fetch when window becomes focused
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications, hasAuthError]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (hasAuthError) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.success(newNotification.title || "New notification");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasAuthError]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      refreshNotifications: async () => {},
      markAsRead: async () => {},
      markAllAsRead: async () => {},
    };
  }
  return context;
}

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AddressManagement } from "@/components/zaha/address-management";

interface BuyerProfile {
  id: string;
  city?: string;
  avatar_url?: string;
  created_at: string;
}

interface NotificationPreferences {
  email_order_updates: boolean;
  email_promotions: boolean;
  push_order_updates: boolean;
  push_promotions: boolean;
}

export function ProfileMobile(): React.ReactElement {
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_order_updates: true,
    email_promotions: true,
    push_order_updates: true,
    push_promotions: false,
  });

  const [formData, setFormData] = useState({
    city: "",
    avatar: null as File | null,
  });

  useEffect(() => {
    loadProfile();
    loadNotificationPreferences();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setBuyerProfile(data.buyerProfile);
        setFormData({ city: data.buyerProfile?.city || "", avatar: null });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadNotificationPreferences() {
    try {
      const response = await fetch("/api/notifications/preferences");
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setNotificationPrefs(data.preferences);
        }
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("city", formData.city);
      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await loadProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNotificationPreferenceChange(
    key: keyof NotificationPreferences,
    value: boolean
  ) {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      toast.error("Failed to update preferences");
      // Revert on error
      setNotificationPrefs(notificationPrefs);
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {buyerProfile?.avatar_url ? (
                      <Image
                        src={buyerProfile.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>Change Avatar</span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, avatar: file });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Casablanca, Marrakech"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <AddressManagement />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your order status
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.email_order_updates}
                      onCheckedChange={(checked) =>
                        handleNotificationPreferenceChange("email_order_updates", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promotions & Offers</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about special offers and promotions
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.email_promotions}
                      onCheckedChange={(checked) =>
                        handleNotificationPreferenceChange("email_promotions", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications about your order status
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.push_order_updates}
                      onCheckedChange={(checked) =>
                        handleNotificationPreferenceChange("push_order_updates", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promotions & Offers</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications about special offers
                      </p>
                    </div>
                    <Switch
                      checked={notificationPrefs.push_promotions}
                      onCheckedChange={(checked) =>
                        handleNotificationPreferenceChange("push_promotions", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


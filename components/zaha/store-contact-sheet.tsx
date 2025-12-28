"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, MessageCircle, Instagram, Facebook, Mail } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/database.types";

type Store = Database["public"]["Tables"]["stores"]["Row"];

interface StoreContactSheetProps {
  store: Store;
  children: ReactNode;
  triggerAsButton?: boolean;
}

export function StoreContactSheet({
  store,
  children,
  triggerAsButton = false,
}: StoreContactSheetProps): React.ReactElement {
  const contactMethods = [];

  if (store.phone) {
    contactMethods.push({
      type: "phone",
      label: "Phone",
      value: store.phone,
      href: `tel:${store.phone.replace(/\s+/g, "")}`,
      icon: Phone,
    });
  }

  if (store.whatsapp) {
    const whatsappNumber = store.whatsapp.replace(/\s+/g, "").replace(/\+/g, "");
    contactMethods.push({
      type: "whatsapp",
      label: "WhatsApp",
      value: store.whatsapp,
      href: `https://wa.me/${whatsappNumber}`,
      icon: MessageCircle,
    });
  }

  if (store.instagram) {
    contactMethods.push({
      type: "instagram",
      label: "Instagram",
      value: store.instagram,
      href: `https://instagram.com/${store.instagram.replace(/^@/, "")}`,
      icon: Instagram,
    });
  }

  if (store.facebook) {
    contactMethods.push({
      type: "facebook",
      label: "Facebook",
      value: store.facebook,
      href: store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`,
      icon: Facebook,
    });
  }

  if (store.email) {
    contactMethods.push({
      type: "email",
      label: "Email",
      value: store.email,
      href: `mailto:${store.email}`,
      icon: Mail,
    });
  }

  if (triggerAsButton && store.phone) {
    // If phone exists and triggerAsButton, render as direct link
    return (
      <Link href={`tel:${store.phone.replace(/\s+/g, "")}`}>
        <Button>Contact</Button>
      </Link>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild={!triggerAsButton}>
        {triggerAsButton ? <Button>{children}</Button> : children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Contact {store.name}</SheetTitle>
          <SheetDescription>Choose a contact method</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {contactMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contact methods available</p>
          ) : (
            contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={method.type}>
                  <Link href={method.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{method.label}</span>
                        <span className="text-xs text-muted-foreground">{method.value}</span>
                      </div>
                    </Button>
                  </Link>
                  {index < contactMethods.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


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
import { Phone, MessageCircle, Instagram, Facebook, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

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
      color: "bg-blue-50 text-blue-600",
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
      color: "bg-green-50 text-green-600",
    });
  }

  if (store.instagram) {
    contactMethods.push({
      type: "instagram",
      label: "Instagram",
      value: store.instagram,
      href: `https://instagram.com/${store.instagram.replace(/^@/, "")}`,
      icon: Instagram,
      color: "bg-pink-50 text-pink-600",
    });
  }

  if (store.facebook) {
    contactMethods.push({
      type: "facebook",
      label: "Facebook",
      value: store.facebook,
      href: store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`,
      icon: Facebook,
      color: "bg-indigo-50 text-indigo-600",
    });
  }

  if (store.email) {
    contactMethods.push({
      type: "email",
      label: "Email",
      value: store.email,
      href: `mailto:${store.email}`,
      icon: Mail,
      color: "bg-neutral-100 text-neutral-600",
    });
  }

  if (triggerAsButton && store.phone) {
    return (
      <Link href={`tel:${store.phone.replace(/\s+/g, "")}`}>
        <Button className="h-11 px-6 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all active:scale-[0.98]">
          Contact Store
        </Button>
      </Link>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild={!triggerAsButton}>
        {triggerAsButton ? <Button className="h-11 px-6 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all active:scale-[0.98]">{children}</Button> : children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[32px] px-8 pt-8 pb-10 border-none shadow-2xl">
        <SheetHeader className="space-y-4 mb-8">
          <SheetTitle className="text-2xl font-bold tracking-tight text-neutral-900">Contact {store.name}</SheetTitle>
          <SheetDescription className="text-neutral-500 text-base">
            Connect directly with the maker to ask questions or discuss your order.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {contactMethods.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <p className="text-sm text-neutral-500 font-medium">No contact methods available for this store.</p>
            </div>
          ) : (
            contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Link key={method.type} href={method.href} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="flex items-center justify-between w-full p-4 rounded-[20px] bg-neutral-50 border border-transparent group-hover:bg-neutral-100 group-hover:border-neutral-200 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-[16px] flex items-center justify-center transition-transform group-hover:scale-110", method.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{method.label}</span>
                        <span className="text-xs text-neutral-500 font-medium">{method.value}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="mt-10">
          <Button 
            className="w-full h-14 bg-neutral-900 text-white hover:bg-neutral-800 rounded-[18px] text-lg font-bold shadow-xl shadow-neutral-200 transition-all active:scale-[0.98]" 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Afus - Authentic Moroccan Craft",
  description: "Discover authentic handmade treasures or share your creations with the world",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
        <Toaster />
      </body>
    </html>
  );
}

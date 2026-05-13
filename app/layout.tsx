import type { Metadata } from "next";
import { Instrument_Sans, Vazirmatn } from "next/font/google";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";
import { Toaster } from "@/components/ui/toaster";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
});

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
    <html lang="en" className={`${instrumentSans.variable} ${vazirmatn.variable}`}>
      <body className="font-sans antialiased">
        <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
        <Toaster />
      </body>
    </html>
  );
}

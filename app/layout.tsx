import type { Metadata } from "next";
import { Instrument_Sans, El_Messiri } from "next/font/google";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";
import { Toaster } from "@/components/ui/toaster";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-el-messiri",
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

import { ScrollToTop } from "@/components/zaha/scroll-to-top";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${elMessiri.variable}`}>
      <head>
        <link href="https://fonts.cdnfonts.com/css/roslindale" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

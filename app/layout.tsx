import type { Metadata } from "next";
import { Instrument_Sans, El_Messiri, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

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

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
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
    <html lang="en" className={`${instrumentSans.variable} ${elMessiri.variable} ${vazirmatn.variable}`}>
      <head>
        <link href="https://fonts.cdnfonts.com/css/roslindale" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";

const interDisplay = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-display",
});

export const metadata: Metadata = {
  title: "Zaha - Authentic Moroccan Craft",
  description: "Discover authentic handmade treasures or share your creations with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interDisplay.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-inter-display), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
      </body>
    </html>
  );
}

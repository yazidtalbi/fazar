import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Andalus - Authentic Moroccan Craft",
  description: "Discover authentic handmade treasures or share your creations with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Instrument Sans';
              src: url('https://cdn.jsdelivr.net/gh/Instrument/instrument-sans@main/fonts/variable/InstrumentSans-Variable.woff2') format('woff2');
              font-weight: 100 900;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: '"Instrument Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <NuqsAdapterProvider>{children}</NuqsAdapterProvider>
        <Toaster />
      </body>
    </html>
  );
}

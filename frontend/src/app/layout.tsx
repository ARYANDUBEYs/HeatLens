import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeatLens — Climate Intelligence & Street-Level Heat Equity",
  description:
    "Microsoft Imagine Cup 2026 (Earth Track) — Satellite-driven urban heat island equity and cooling infrastructure optimization for Delhi NCR.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Azure Maps Atlas SDK CSS */}
        <link
          rel="stylesheet"
          href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css"
          type="text/css"
        />
      </head>
      <body className="min-h-screen bg-canvas text-text-primary font-sans flex flex-col selection:bg-azure-soft selection:text-azure-primary">
        <TopNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { KioskBodyClass } from "@/components/KioskBodyClass";

export const metadata: Metadata = {
  title: "Flow State by FreightRoll",
  description: "From turbulence to throughput."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void text-white">
        <KioskBodyClass />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

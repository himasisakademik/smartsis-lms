import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMARTSIS | Himasis",
  description:
    "Master coding the modern way with expertly crafted courses, modules, and hands-on lessons.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-himasis.png",
    shortcut: "/logo-himasis.png",
    apple: "/logo-himasis.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SMARTSIS",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import InstallBanner from "@/components/InstallBanner";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitSquad",
  description: "Split expenses with friends & groups",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SplitSquad",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F6E56",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-gray-50">
        <AuthProvider>
          <ServiceWorkerRegistrar />
          <InstallBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

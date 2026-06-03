import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketo - Your Marketplace, Your Way",
  description: "Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.",
  keywords: ["Marketo", "marketplace", "e-commerce", "digital products", "freelance", "online shop", "seller"],
  authors: [{ name: "Marketo" }],
  openGraph: {
    title: "Marketo - Your Marketplace, Your Way",
    description: "Create your own customizable shop, sell digital & physical products, or offer freelance services.",
    siteName: "Marketo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketo - Your Marketplace, Your Way",
    description: "Create your own customizable shop, sell digital & physical products, or offer freelance services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

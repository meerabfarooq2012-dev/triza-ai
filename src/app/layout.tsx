import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { RootJsonLd } from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Thiora Marketplace",
    default: "Thiora - Freelance. Digital. Physical. One Platform.",
  },
  description:
    "Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.",
  keywords: [
    "marketplace",
    "freelance",
    "digital products",
    "sell online",
    "Thiora",
    "Pakistan",
    "online shop",
    "e-commerce",
    "freelance services",
    "digital downloads",
    "physical products",
    "seller",
  ],
  authors: [{ name: "Thiora", url: "https://thiora.vercel.app" }],
  creator: "Thiora",
  publisher: "Thiora",
  metadataBase: new URL("https://thiora.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ur: "/?lang=ur",
      ar: "/?lang=ar",
      hi: "/?lang=hi",
      bn: "/?lang=bn",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Thiora",
  },
  openGraph: {
    title: "Thiora - Freelance. Digital. Physical. One Platform.",
    description:
      "Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.",
    siteName: "Thiora",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Thiora Marketplace — Freelance. Digital. Physical.",
      },
    ],
    locale: "en_US",
    alternateLocale: ["ur_PK", "ar_SA", "hi_IN", "bn_BD"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thiora - Freelance. Digital. Physical. One Platform.",
    description:
      "Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.",
    images: ["/og-image.png"],
    creator: "@thiora",
    site: "@thiora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "marketplace",
  classification: "Marketplace Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Early ChunkLoadError recovery — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var done=false;
                function reload(){if(done)return;done=true;var u=new URL(location.href);u.searchParams.set('_r',Date.now());location.replace(u.toString())}
                window.addEventListener('error',function(e){
                  var m=e.message||'';
                  if(m.indexOf('ChunkLoadError')!==-1||m.indexOf('Loading chunk')!==-1||m.indexOf('Failed to load chunk')!==-1){e.preventDefault();reload()}
                  if(e.error&&e.error.name==='ChunkLoadError'){e.preventDefault();reload()}
                });
                window.addEventListener('unhandledrejection',function(e){
                  var r=e.reason;
                  if(r&&(r.name==='ChunkLoadError'||(r.message&&(r.message.indexOf('ChunkLoadError')!==-1||r.message.indexOf('Loading chunk')!==-1||r.message.indexOf('Failed to load chunk')!==-1)))){e.preventDefault();reload()}
                });
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Thiora" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Thiora" />
        <meta name="msapplication-TileColor" content="#d97706" />
        <meta name="msapplication-navbutton-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        {/* Prevent phone number detection for native app feel */}
        <meta name="format-detection" content="telephone=no" />
        {/* JSON-LD Structured Data for SEO rich results */}
        <RootJsonLd />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased bg-background text-foreground
          min-h-dvh overflow-x-hidden
          supports-[height:100dvh]:min-h-[100dvh]
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PwaProvider>
            {children}
          </PwaProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

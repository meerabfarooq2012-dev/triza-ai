import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    template: "%s | TRIZA AI",
    default: "TRIZA — Self-Built AI · Pure Reasoning Engine",
  },
  description:
    "TRIZA is a 100% self-built AI with zero external API dependencies. A pure TypeScript reasoning pipeline — mood, intent, knowledge, and self-expression — wrapped in a professional AI workspace.",
  keywords: [
    "TRIZA",
    "TRIZA AI",
    "self-built AI",
    "AI workspace",
    "reasoning engine",
    "no external APIs",
    "HDC",
    "cognitive engine",
    "chat AI",
    "local AI",
  ],
  authors: [{ name: "TRIZA", url: "https://triza-ai.vercel.app" }],
  creator: "TRIZA",
  publisher: "TRIZA",
  metadataBase: new URL("https://triza-ai.vercel.app"),
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
    // Use PNG (not SVG) for shortcut icon — Google's favicon crawler
    // handles PNG more reliably than SVG, ensuring the TRIZA neural
    // logo appears correctly in Google search results.
    shortcut: "/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TRIZA",
  },
  openGraph: {
    title: "TRIZA — Self-Built AI · Pure Reasoning Engine",
    description:
      "TRIZA is a 100% self-built AI with zero external API dependencies. A pure TypeScript reasoning pipeline — mood, intent, knowledge, and self-expression.",
    siteName: "TRIZA",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "TRIZA — Self-Built AI · Pure Reasoning Engine",
      },
    ],
    locale: "en_US",
    alternateLocale: ["ur_PK", "ar_SA", "hi_IN", "bn_BD"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRIZA — Self-Built AI · Pure Reasoning Engine",
    description:
      "TRIZA is a 100% self-built AI with zero external API dependencies. A pure TypeScript reasoning pipeline — mood, intent, knowledge, and self-expression.",
    images: ["/og-image.png"],
    creator: "@triza_ai",
    site: "@triza_ai",
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
  category: "technology",
  classification: "AI Application",
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
        {/* Force-clear stale service worker caches from older versions (thiora-v*, triza-v1..v4).
             This runs BEFORE React hydrates so the user always gets fresh JS bundles.
             Uses localStorage so the migration happens exactly ONCE per browser —
             after that the new triza-v5 SW registers and works normally. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if(!('serviceWorker' in navigator)) return;
                var REQUIRED = 'triza-v5';
                var KEY = 'triza_sw_version';
                try {
                  var current = localStorage.getItem(KEY) || '';
                  if(current === REQUIRED) return; // already migrated, skip

                  // Migrate: unregister all SWs + clear all caches + reload once
                  navigator.serviceWorker.getRegistrations().then(function(regs){
                    return Promise.all(regs.map(function(r){ return r.unregister(); }));
                  }).then(function(){
                    if('caches' in window){
                      return caches.keys().then(function(keys){
                        return Promise.all(keys.map(function(k){ return caches.delete(k); }));
                      });
                    }
                  }).then(function(){
                    localStorage.setItem(KEY, REQUIRED);
                    var u = new URL(location.href);
                    u.searchParams.set('_sw', Date.now());
                    location.replace(u.toString());
                  }).catch(function(e){
                    // Even on error, mark as migrated so we don't loop
                    try { localStorage.setItem(KEY, REQUIRED); } catch(_){}
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TRIZA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="TRIZA" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-navbutton-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        {/* Prevent phone number detection for native app feel */}
        <meta name="format-detection" content="telephone=no" />
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

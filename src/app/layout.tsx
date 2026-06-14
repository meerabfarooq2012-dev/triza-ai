import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { PwaProvider } from "@/components/providers/pwa-provider";

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
  title: "Thiora - Freelance. Digital. Physical. One Platform.",
  description: "Freelance services, digital downloads, and physical products — three worlds, one marketplace.",
  keywords: ["Thiora", "marketplace", "e-commerce", "digital products", "freelance", "online shop", "seller"],
  authors: [{ name: "Thiora" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Thiora",
  },
  openGraph: {
    title: "Thiora - Freelance. Digital. Physical. One Platform.",
    description: "Freelance services, digital downloads, and physical products — three worlds, one marketplace.",
    siteName: "Thiora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thiora - Freelance. Digital. Physical. One Platform.",
    description: "Freelance services, digital downloads, and physical products — three worlds, one marketplace.",
  },
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

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
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Marketo - Your Marketplace, Your Way",
  description: "Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.",
  keywords: ["Marketo", "marketplace", "e-commerce", "digital products", "freelance", "online shop", "seller"],
  authors: [{ name: "Marketo" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Marketo",
  },
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
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

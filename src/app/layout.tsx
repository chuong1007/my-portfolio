import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Outfit, Syne, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Contact } from "@/components/sections/Contact";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'CHUONG.PORTFOLIO | Visual Designer & Brand Identity Specialist',
  description: 'Portfolio của Chuong Thanh - Visual Designer chuyên nghiệp tại TP.HCM. Chuyên về nhận diện thương hiệu, thiết kế đồ họa và trải nghiệm thị giác.',
  metadataBase: new URL('https://chuong-graphic.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CHUONG.PORTFOLIO | Visual Designer',
    description: 'Visual Designer based in Ho Chi Minh City.',
    url: 'https://chuong-graphic.vercel.app',
    siteName: 'CHUONG.PORTFOLIO',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CHUONG.PORTFOLIO | Visual Designer',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHUONG.PORTFOLIO | Visual Designer',
    description: 'Visual Designer based in Ho Chi Minh City.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

import { AdminProvider } from "@/context/AdminContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdminEditButton } from "@/components/builder/AdminEditButton";
import { GlobalPreviewWrapper } from "./GlobalPreviewWrapper";
import { Analytics } from "@vercel/analytics/next";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SmoothScrollSnap } from "@/components/SmoothScrollSnap";
import ChatbotGate from "@/components/AIChatbot/ChatbotGate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${syne.variable} ${montserrat.variable} antialiased min-h-screen font-sans flex flex-col`}
        suppressHydrationWarning
      >
        {/* No-FOUC: apply theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('portfolio-theme');
                var html = document.documentElement;
                if (t === 'light') { html.classList.remove('dark'); }
                else { html.classList.add('dark'); }
                // Also clean browser extension attributes
                document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                  el.removeAttribute('bis_skin_checked');
                });
              } catch(e) {}
            `,
          }}
        />
        <ThemeProvider>
                    <AdminProvider>
            <GlobalPreviewWrapper>
              {children}
            </GlobalPreviewWrapper>
            <SmoothScrollSnap />
            <ChatbotGate />
          </AdminProvider>
        </ThemeProvider>
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}

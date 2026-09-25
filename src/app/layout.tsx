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
  title: {
    default: 'CHUONG.PORTFOLIO | Visual Designer',
    template: '%s | CHUONG.PORTFOLIO',
  },
  description: 'Thiết kế nhận diện thương hiệu, ấn phẩm đồ hoạ, quảng cáo đa nền tảng, thiết kế bao bì tại TP.HCM. Xem ngay các dự án sáng tạo nổi bật và hồ sơ năng lực.',
  keywords: [
    'thiết kế đồ họa', 'graphic designer', 'brand identity', 'nhận diện thương hiệu',
    'thiết kế bao bì', 'packaging design', 'thiết kế quảng cáo', 'ấn phẩm đồ hoạ',
    'visual designer', 'freelance designer', 'designer TPHCM', 'designer Hồ Chí Minh',
    'logo design', 'branding', 'CHUONG.GRAPHIC', 'portfolio thiết kế'
  ],
  authors: [{ name: 'Thanh Chương', url: 'https://chuong-graphic.vercel.app' }],
  creator: 'Thanh Chương',
  publisher: 'CHUONG.PORTFOLIO',
  metadataBase: new URL('https://chuong-graphic.vercel.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'CHUONG.PORTFOLIO | Visual Designer',
    description: 'Thiết kế nhận diện thương hiệu, ấn phẩm đồ hoạ, quảng cáo đa nền tảng, thiết kế bao bì tại TP.HCM. Xem ngay các dự án sáng tạo nổi bật và hồ sơ năng lực.',
    url: 'https://chuong-graphic.vercel.app',
    siteName: 'CHUONG.PORTFOLIO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CHUONG.PORTFOLIO | Visual Designer tại TP.HCM',
        type: 'image/png',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHUONG.PORTFOLIO | Visual Designer',
    description: 'Thiết kế nhận diện thương hiệu, ấn phẩm đồ hoạ, quảng cáo đa nền tảng, thiết kế bao bì tại TP.HCM. Xem ngay các dự án sáng tạo nổi bật và hồ sơ năng lực.',
    images: ['/og-image.png'],
    creator: '@chuong_graphic',
  },
  verification: {
    google: 'aqSYS6fzCStvSvHqick6zrJxLpEUEulLwkmZ2GvUqvk',
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
import { DynamicTitle } from "@/components/DynamicTitle";

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
        <DynamicTitle />
        <ThemeProvider>
                    <AdminProvider>
            <GlobalPreviewWrapper>
              {children}
            </GlobalPreviewWrapper>
            <SmoothScrollSnap />
          </AdminProvider>
        </ThemeProvider>
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}

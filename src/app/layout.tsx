import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'CHUONG.PORTFOLIO | Visual Designer',
  description: 'Portfolio của Chương - Visual Designer based in Ho Chi Minh City với hơn 7 năm kinh nghiệm chuyên môn về Graphic, Branding và UX/UI Design.',
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
import { AdminEditButton } from "@/components/builder/AdminEditButton";
import { GlobalPreviewWrapper } from "./GlobalPreviewWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-zinc-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-zinc-50 selection:text-zinc-950 bg-zinc-950 text-zinc-50 min-h-screen font-sans flex flex-col`}
      >
        <AdminProvider>
          <GlobalPreviewWrapper>
            {children}
          </GlobalPreviewWrapper>
        </AdminProvider>
      </body>
    </html>
  );
}

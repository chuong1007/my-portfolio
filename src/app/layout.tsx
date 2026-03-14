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
  title: "Chương Graphic | Portfolio & Design",
  description: "Visual Designer based in Ho Chi Minh City",
};

import { AdminProvider } from "@/context/AdminContext";

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
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Contact />
        </AdminProvider>
      </body>
    </html>
  );
}

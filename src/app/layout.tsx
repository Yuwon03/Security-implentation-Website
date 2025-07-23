import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/navigation";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wallpaper Master",
  description: "The best wallpaper in Sydney/Melbourne",
  icons: {
    icon: "public/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex justify-between items-center py-4 px-8 bg-white text-black text-xl">
          <Navigation />
        </header>
        <hr className="border-t-4 border-gray-200" />
        {children}
        <footer className="flex justify-center items-center p-4 bg-white text-black mt-10 text-center">
          <p>
            Wallpaper Masters Pty Ltd ABN: 25 491 108 839<br />
            Copyright © 2006 Bruce Choi&nbsp;&nbsp;
            <a style={{ color: "blue", marginLeft: "1rem" }} href="/about">
              About Us
            </a>
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}

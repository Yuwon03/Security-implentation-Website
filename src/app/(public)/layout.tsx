import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/navigation";
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link";


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
        <Navigation />
        <main className="pt-12">{children}</main>
        <footer className="flex justify-center items-center p-4 bg-white text-black mt-10 text-center">
          <p>
            Wallpaper Masters Pty Ltd ABN: 25 491 108 839<br />
            Showroom: 1 Vinegar Hill Rd Kellyville Ridge NSW 2155<br />
            Copyright © 2006 Bruce Choi&nbsp;&nbsp;
            <Link
              href="/about"
              className="text-blue-600 underline-offset-2 hover:underline ml-4"
            >
              About Us
            </Link>
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}

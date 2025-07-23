// src/app/panel/layout.tsx
import "../../globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ClientProvider from "./ClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClientProvider>{children}</ClientProvider>
    </div>
  );
}

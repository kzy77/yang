import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/components/responsive.css";
import "@/components/animations.css"; 
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "羊了个羊",
  description: "羊了个羊游戏 - Next.js 版本",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

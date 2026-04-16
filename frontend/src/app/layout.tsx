import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONRADIO | Tu radio en la nube",
  description: "Streaming y gestión de radio profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <style dangerouslySetInnerHTML={{__html: `
          ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; display: none; }
          * { scrollbar-width: none; -ms-overflow-style: none; }
        `}} />
        {children}
      </body>
    </html>
  );
}

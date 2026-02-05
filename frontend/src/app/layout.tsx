import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NexLevel Speech - AI Voice Cloning & Text-to-Speech",
    template: "%s | NexLevel Speech",
  },
  description: "Clone your voice with AI and generate natural speech in 29+ languages. Create professional voiceovers, audiobooks, and more with NexLevel Speech.",
  keywords: ["AI voice cloning", "text to speech", "TTS", "voice generator", "voice synthesis", "ElevenLabs alternative"],
  authors: [{ name: "NexLevel Speech" }],
  openGraph: {
    title: "NexLevel Speech - AI Voice Cloning & Text-to-Speech",
    description: "Clone your voice with AI and generate natural speech in 29+ languages.",
    type: "website",
    locale: "en_US",
    siteName: "NexLevel Speech",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexLevel Speech - AI Voice Cloning & Text-to-Speech",
    description: "Clone your voice with AI and generate natural speech in 29+ languages.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

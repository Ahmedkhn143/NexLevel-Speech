import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexLevel Speech - AI Voice Cloning & Text-to-Speech",
  description: "Clone your voice with AI and generate natural speech in 29+ languages. Create professional voiceovers, audiobooks, and more with NexLevel Speech.",
  keywords: "AI voice cloning, text to speech, TTS, voice generator, voice synthesis, Pakistan",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

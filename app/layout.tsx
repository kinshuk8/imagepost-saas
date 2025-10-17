import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./providers/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ImagePost - Transform Your Media Effortlessly",
    template: "%s | ImagePost",
  },
  description:
    "Upload, optimize, and transform your videos and images for any platform. Built for creators, powered by Cloudinary.",
  keywords: [
    "image optimization",
    "video processing",
    "social media images",
    "cloudinary",
    "media management",
    "content creation",
  ],
  authors: [{ name: "ImagePost" }],
  creator: "ImagePost",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imagepost.app",
    title: "ImagePost - Transform Your Media Effortlessly",
    description:
      "Upload, optimize, and transform your videos and images for any platform.",
    siteName: "ImagePost",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImagePost - Transform Your Media Effortlessly",
    description:
      "Upload, optimize, and transform your videos and images for any platform.",
    creator: "@imagepost",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ConvexClientProvider>
  );
}

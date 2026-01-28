import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovieVerse | AI-Powered Movie Discovery",
  description:
    "Find your next favorite movie or TV show using AI. Personalized recommendations based on your unique vibe, tailored just for you.",
  openGraph: {
    title: "MovieVerse | AI-Powered Movie Discovery",
    description:
      "Find your next favorite movie or TV show using AI. Personalized recommendations based on your unique vibe.",
    url: "https://movieverse.pxxl.click",
    siteName: "MovieVerse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MovieVerse Landing Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVerse | AI-Powered Movie Discovery",
    description:
      "Find your next favorite movie or TV show using AI. Personalized recommendations based on your unique vibe.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased`}>{children}</body>
    </html>
  );
}

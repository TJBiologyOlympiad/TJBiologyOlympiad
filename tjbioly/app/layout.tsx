import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavbarManager from "./components/NavbarManager";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const description =
  "TJ Biology Olympiad advances the knowledge of biology at Thomas Jefferson High School, preparing students for the USA Biology Olympiad and hosting our own contests. Meetings every Friday 8B.";

export const metadata: Metadata = {
  title: "TJ Biology Olympiad",
  description,
  metadataBase: new URL("https://tjbiologyolympiad.org"),
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "TJ Biology Olympiad",
    description,
    images: ["/logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TJ Biology Olympiad",
    description,
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#f6f6f3] text-neutral-800">
        <NavbarManager />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

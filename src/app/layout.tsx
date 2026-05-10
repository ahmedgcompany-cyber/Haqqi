import type { Metadata } from "next";
import { Cairo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://haqqi.vercel.app"),
  title: {
    default: "Haqqi | GCC Gratuity, WPS, and Settlement Platform",
    template: "%s | Haqqi",
  },
  description:
    "Haqqi helps GCC SMBs manage WPS compliance, end-of-service gratuity, employee rosters, and final settlements in Arabic and English.",
  openGraph: {
    title: "Haqqi",
    description:
      "Bilingual HR compliance workflows for GCC SMBs, from WPS files to gratuity calculations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable} ${mono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}

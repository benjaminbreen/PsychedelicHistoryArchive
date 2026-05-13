import type { Metadata } from "next";
import {
  Antonio,
  Cormorant_Garamond,
  Newsreader,
  Source_Sans_3,
  Source_Serif_4
} from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader"
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond"
});

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "The Psychedelic History Archive",
  description:
    "A scholarly record of primary sources, biographies, images, audio, and personal histories documenting psychedelic history and altered states."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable} ${newsreader.variable} ${cormorantGaramond.variable} ${antonio.variable}`}>
      <body>{children}</body>
    </html>
  );
}

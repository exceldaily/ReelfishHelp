import type { Metadata, Viewport } from "next";
import { Geist, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "ReelFishHelp — Find, identify, and catch more fish",
    template: "%s · ReelFishHelp",
  },
  description:
    "Location-based fishing intelligence for US anglers: live conditions and tides, species catch guides, photo fish ID, trip planning, and catch logging.",
  other: {
    "impact-site-verification": "072a5cba-8378-4ade-b12e-a6cd53870c20",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a2430",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Impact uses a nonstandard value= attribute; React hoists this into <head> */}
        <meta
          name="impact-site-verification"
          {...{ value: "072a5cba-8378-4ade-b12e-a6cd53870c20" }}
        />
        {children}
      </body>
    </html>
  );
}

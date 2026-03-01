import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {TooltipProvider} from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FDO Modular Minting and Enablement Toolkit",
  description: "Mint your FDOs easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" id="daisyui">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ThemeProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}

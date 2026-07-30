import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FAIR DO Modular Minting and Enablement Toolkit",
  description: "Mint your FAIR DOs easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" id="daisyui" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('fdmoment-user-settings');
                  let theme = 'system';
                  if (stored) {
                    try {
                      const settings = JSON.parse(stored);
                      theme = settings.theme || 'system';
                    } catch (e) {}
                  }
                  
                  const root = document.documentElement;
                  if (theme === 'system') {
                    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.setAttribute('data-theme', systemDark ? 'business' : 'silk');
                  } else {
                    root.setAttribute('data-theme', theme === 'dark' ? 'business' : 'silk');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

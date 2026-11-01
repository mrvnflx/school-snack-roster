import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snack Roster",
  description: "Classroom snack sign-up, automated.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Snacks" },
};

export const viewport: Viewport = {
  themeColor: "#15803D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <body>
        <div className="sr-app">
          {children}
        </div>
        <RegisterSW />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEELAI – AI Jobs Platform",
  description: "The world's premier AI-powered remote job platform connecting global talent to leading AI companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

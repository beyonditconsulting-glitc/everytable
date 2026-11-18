import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Breakroom Lead Finder",
  description:
    "Find nearby gyms, clinics, schools, and offices and send them a free sample meal drop offer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

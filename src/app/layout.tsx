import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVA — Global Legal Intelligence System",
  description:
    "Structured legal analysis assistant. Educational use only — not a substitute for a licensed legal professional.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

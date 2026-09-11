import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truck Route Visualizer — FreightFox",
  description:
    "A road-based delivery route simulation with playback controls and stop tracking.",
  keywords: ["truck", "route", "delivery", "map", "FreightFox", "logistics"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

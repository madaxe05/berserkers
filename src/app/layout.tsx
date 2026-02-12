import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Anna-Chain — Smart Food Waste Redistribution",
  description:
    "Transforming urban food waste into affordable animal feed while tracking carbon impact. A digital circular economy platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="particle-bg" />
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

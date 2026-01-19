import React from "react";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata = {
  title: "SENTRA Authority Dashboard",
  description: "Command center for SENTRA authorities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "Golf360",
  description: "Golf booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #02111f 0%, #00174d 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <ToastProvider>
          <AppChrome />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ 
  subsets: ["latin"],
  variable: "--font-caveat",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Pinwall",
  description: "An anonymous room-based message wall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${caveat.variable} font-caveat antialiased text-dark-brown`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Debt-Optimiser",
  description: "Create the fastest and smartest path to becoming debt-free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#faf4f0] text-slate-900 selection:bg-[#00e5ff] selection:text-slate-950`}>
        <Navbar />

        {children}
      </body>
    </html>
  );
}
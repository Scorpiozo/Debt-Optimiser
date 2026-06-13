import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
        
        {/* Universal Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-[#39ad94]/80 backdrop-blur-md border-b border-slate-300/60 px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-slate-950 flex items-center justify-center font-black text-[#00e5ff] text-base shadow-sm">
                %
              </div>
              <span className="font-extrabold text-lg text-slate-950 tracking-tight uppercase">Debt-Optimiser</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/profile">
                <div className="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-[#00ffb7] hover:shadow-md hover:scale-105 transition-all cursor-pointer">
                  JD
                </div>
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
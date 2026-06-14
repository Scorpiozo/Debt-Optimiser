import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-screen bg-[#faf4f0] text-slate-900 selection:bg-[#00e5ff] selection:text-slate-950`}>
        
        {/* Dynamically determines layout design based on routing state */}
        <ConditionalNavbar />

        {children}
      </body>
    </html>
  );
}
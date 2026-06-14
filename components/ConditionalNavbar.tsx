"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../lib/firebase"; // Double-check this path matches your file structure
import { onAuthStateChanged } from "firebase/auth";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [initials, setInitials] = useState("DO"); // "DO" as a meaningful default fallback for Debt Optimiser
  
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isActive = (path: string) => pathname === path;

  // Listen to Firebase Auth state change and extract initials
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        // Example: "John Doe" -> ["John", "Doe"] -> ["J", "D"] -> "JD"
        const parts = user.displayName.trim().split(/\s+/);
        const userInitials = parts
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2); // Enforce 2 letters max
        
        setInitials(userInitials || "DO");
      } else if (user && user.email) {
        // Fallback: Use first two letters of their email if display name isn't set yet
        setInitials(user.email.slice(0, 2).toUpperCase());
      } else {
        setInitials("DO"); // Default if logged out
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 bg-[#39ad94]/80 backdrop-blur-md border-b border-slate-300/60 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 select-none opacity-90">
            <div className="h-9 w-9 rounded-lg bg-slate-950 flex items-center justify-center font-black text-[#00e5ff] text-base shadow-sm">
              %
            </div>
            <span className="font-extrabold text-lg text-slate-950 tracking-tight uppercase">
              Debt-Optimiser
            </span>
          </div>
          <div className="text-xs font-black uppercase text-slate-700 tracking-wider bg-white/30 px-3 py-1 rounded-md">
            Secure Portal
          </div>
        </div>
      </header>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#39ad94]/80 backdrop-blur-md border-b border-slate-300/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        
        <Link href="/">
          <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="h-9 w-9 rounded-lg bg-slate-950 flex items-center justify-center font-black text-[#00e5ff] text-base shadow-sm">
              %
            </div>
            <span className="font-extrabold text-lg text-slate-950 tracking-tight uppercase">
              Debt-Optimiser
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Link Menu Stack */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/payoff-plans">
            <span className={`text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
              isActive("/payoff-plans") ? "text-white bg-slate-950 px-2.5 py-1 rounded-md" : "text-slate-950 hover:text-white"
            }`}>
              Payoff Plans
            </span>
          </Link>
          
          <Link href="/">
            <span className={`text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
              isActive("/") ? "text-white bg-slate-950 px-2.5 py-1 rounded-md" : "text-slate-950 hover:text-white"
            }`}>
              Dashboard
            </span>
          </Link>

          <Link href="/about">
            <span className="text-xs font-black uppercase text-slate-950 hover:text-slate-800 transition-colors cursor-pointer tracking-wider bg-white/40 px-2.5 py-1 rounded-md border border-slate-950/10">
              About Usage
            </span>
          </Link>

          {/* Profile Avatar with Dynamic Meaningful Initials */}
          <Link href="/profile">
            <div className="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-[#00ffb7] hover:shadow-md hover:scale-105 transition-all cursor-pointer select-none">
              {initials}
            </div>
          </Link>
        </div>

        {/* Mobile Hamburger Menu Trigger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="p-2 rounded-md text-slate-950 hover:bg-white/20 focus:outline-none transition-colors"
          >
            {isOpen ? (
              <svg className="h-6 w-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay Panel */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-[#2d8d78] border-t border-slate-950/10 transition-all`}>
        <div className="px-4 pt-2 pb-6 space-y-3 shadow-inner">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <div className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
              isActive("/") ? "bg-slate-950 text-white shadow-md" : "text-slate-950 bg-white/40"
            }`}>
              📊 Dashboard
            </div>
          </Link>

          <Link href="/payoff-plans" onClick={() => setIsOpen(false)}>
            <div className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
              isActive("/payoff-plans") ? "bg-slate-950 text-white shadow-md" : "text-slate-950 bg-white/40"
            }`}>
              🎯 Payoff Plans
            </div>
          </Link>

          <Link href="/about" onClick={() => setIsOpen(false)}>
            <div className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide text-slate-950 bg-white/40 transition-all ${
              isActive("/about") ? "bg-slate-950 text-white" : ""
            }`}>
              ℹ️ About Usage
            </div>
          </Link>

          {/* Dedicated Profile Bar for Mobile with Dynamic Meaningful Initials */}
          <Link href="/profile" onClick={() => setIsOpen(false)}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wide border-2 border-slate-950 transition-all ${
              isActive("/profile") ? "bg-slate-950 text-white" : "bg-white text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,229,255,1)]"
            }`}>
              <div className="h-6 w-6 rounded-full bg-slate-950 text-[10px] font-black text-[#00ffb7] flex items-center justify-center border border-white/20 select-none">
                {initials}
              </div>
              View Profile Settings
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
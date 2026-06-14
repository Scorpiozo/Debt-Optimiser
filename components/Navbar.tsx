"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

function getInitials(name?: string, email?: string) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0][0] || "";
    const second = parts[1] ? parts[1][0] : "";
    return (first + second).toUpperCase();
  }
  if (email && email.length > 0) return email[0].toUpperCase();
  return null;
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : null;
          setProfile(data);
          const initials = getInitials(data?.displayName, u.email);
          setInitials(initials);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          const initials = getInitials(undefined, u?.email);
          setInitials(initials);
        }
      } else {
        setProfile(null);
        setInitials(null);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#39ad94]/80 backdrop-blur-md border-b border-slate-300/60 px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="h-9 w-9 rounded-lg bg-slate-950 flex items-center justify-center font-black text-[#00e5ff] text-base shadow-sm">%</div>
            <span className="font-extrabold text-lg text-slate-950 tracking-tight uppercase">Debt-Optimiser</span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
          <Link href="/about">
            <span className="text-xs font-black uppercase text-slate-950 hover:text-slate-800 transition-colors cursor-pointer tracking-wider bg-white/40 px-2.5 py-1 rounded-md border border-slate-950/10">About Usage</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-[#00ffb7] hover:shadow-md hover:scale-105 transition-all cursor-pointer"
              aria-label="Open profile menu"
            >
              {initials ? (
                <span>{initials}</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00ffb7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-950 rounded-lg shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-black text-slate-900">{profile?.displayName || user?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link href="/profile">
                    <button className="w-full text-left py-2 px-3 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase">Profile</button>
                  </Link>
                </div>
                <div className="p-2">
                  <button onClick={handleSignOut} className="w-full py-2 px-3 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

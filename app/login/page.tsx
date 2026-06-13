"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import WhiteCard from "../../components/WhiteCard";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center px-4">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#faf4f0] px-4">
      <WhiteCard className="w-full max-w-xl">
        {/* Dual Tab Toggle Header */}
        <div className="grid w-full grid-cols-2 gap-0 mb-6 border-2 border-slate-950 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`py-3 font-black text-sm uppercase tracking-wider transition-all ${
              mode === "signin"
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-950 hover:bg-slate-100"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`py-3 font-black text-sm uppercase tracking-wider transition-all ${
              mode === "signup"
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-950 hover:bg-slate-100"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {mode === "signin"
              ? "Enter your credentials to access your account"
              : "Get started with Debt-Optimiser today"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-xs font-black text-red-700 uppercase tracking-wide">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field - Sign Up Only */}
          {mode === "signup" && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? "Loading..." : mode === "signin" ? "Sign In to Account" : "Register Account"}
          </button>
        </form>
      </WhiteCard>
    </div>
  );
}
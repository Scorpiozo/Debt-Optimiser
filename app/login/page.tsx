"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  // Tracking which mode the user is looking at: "signin" or "signup"
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
  // Reactive form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only used during Sign Up

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      console.log("Logging in with:", { email, password });
    } else {
      console.log("Registering with:", { name, email, password });
    }
  };

  return (
    // h-[calc(100vh-64px)] and overflow-hidden removes scrolling, accounting for your top navbar height
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 overflow-hidden dark:bg-slate-950">
      
      {/* Max width bumped to max-w-xl to make the overall size noticeably bigger */}
      <Card className="w-full max-w-xl shadow-xl border-t-4 border-t-emerald-400 transition-all duration-300">
        
        {/* Simple Dual Tab Toggle Header */}
        <div className="grid w-full grid-cols-2 border-b text-center font-medium text-sm">
          <button
            type="button"
            className={`py-4 transition-all ${mode === "signin" ? "border-b-2 border-slate-900 font-bold text-slate-900 bg-slate-100/50" : "text-slate-500 hover:text-slate-800"}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`py-4 transition-all ${mode === "signup" ? "border-b-2 border-slate-900 font-bold text-slate-900 bg-slate-100/50" : "text-slate-500 hover:text-slate-800"}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <CardHeader className="text-center pt-6 pb-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === "signin" 
              ? "Enter your credentials to access your account" 
              : "Get started with Debt-Optimiser today"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 py-4">
            
            {/* Conditional Name Field - Only shows up if 'signup' is active */}
            {mode === "signup" && (
              <div className="space-y-2 transition-all duration-200">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="h-11 text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-11 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          
          <CardFooter className="pt-2 pb-6">
            <Button type="submit" className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white">
              {mode === "signin" ? "Sign In to Account" : "Register Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
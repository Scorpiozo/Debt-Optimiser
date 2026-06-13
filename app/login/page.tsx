"use client";

import React, { useState } from "react";
// Import useRouter from Next.js navigation
import { useRouter } from "next/navigation"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import Firebase authentication and Firestore functions
import { auth, db, googleProvider } from "@/lib/firebase"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  // Initialize the router
  const router = useRouter(); 

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setName("");
    setError(null); // Also clear any errors from the previous screen
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Successfully logged in!");
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: name,
          email: email,
          createdAt: new Date(),
          bestReactionTime: null,
          totalAttempts: 0
        });
        console.log("Account created!");
      }

      router.push("/dashboard"); 

    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(getFriendlyErrorMessage(err.code));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Trigger the Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Check if this user already has a database profile
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // 3. If they don't exist, create their profile!
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "New Player", 
          email: user.email,
          createdAt: new Date(),
          bestReactionTime: null,
          totalAttempts: 0
        });
        console.log("New Google account registered!");
      } else {
        console.log("Existing Google user logged in!");
      }

      router.push("/play"); 

    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(getFriendlyErrorMessage(err.code)); 
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/weak-password":
        return "Your password must be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please take a break and try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "An unexpected error occurred. Please try again."; 
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 overflow-hidden dark:bg-slate-950">
      <Card className="w-full max-w-xl shadow-xl border-t-4 border-t-emerald-400 transition-all duration-300">
        
        <div className="grid w-full grid-cols-2 border-b text-center font-medium text-sm">
          <button
            type="button"
            className={`py-4 transition-all ${mode === "signin" ? "border-b-2 border-slate-900 font-bold text-slate-900 bg-slate-100/50" : "text-slate-500 hover:text-slate-800"}`}
            onClick={() => handleModeSwitch("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`py-4 transition-all ${mode === "signup" ? "border-b-2 border-slate-900 font-bold text-slate-900 bg-slate-100/50" : "text-slate-500 hover:text-slate-800"}`}
            onClick={() => handleModeSwitch("signup")}
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
            
            {/* Display Firebase Errors visually if they occur */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

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
          
          <CardFooter className="flex-col space-y-4 pt-2 pb-6">
            
            {/* Standard Email/Password Button */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-70"
            >
              {isLoading 
                ? "Processing..." 
                : mode === "signin" ? "Sign In to Account" : "Register Account"}
            </Button>

            {/* The "OR" Divider */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* The Google Sign-In Button */}
            <Button 
              type="button" 
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 text-base font-medium border-slate-200 hover:bg-slate-50 text-slate-900"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase"; 
import { doc, setDoc, getDoc } from "firebase/firestore";

// UI Components
import { Card, CardDescription, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
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
    setError(null);
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
        console.log("Attempting to register:", email);
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", userCred.user.uid), {
          displayName: name, 
          email: email,
          createdAt: new Date().toISOString()
        });
        console.log("Account created successfully!");
      }

      // Safe navigation after state updates finish
      router.push("/profile"); 

    } catch (err: any) {
      console.error("Authentication error caught:", err);
      
      const errorCode = err?.code || "unknown";
      setError(getFriendlyErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: user.displayName || "New User", 
          email: user.email,
          createdAt: new Date().toISOString()
        });
        console.log("New Google account registered!");
      } else {
        console.log("Existing Google user logged in!");
      }

      // Route target redirected straight to profile configuration
      router.push("/profile"); 

    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(getFriendlyErrorMessage(err.code)); 
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password. Please check your credentials and try again.";
        
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <Card className="w-full max-w-xl shadow-xl border-t-4 border-t-emerald-400 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:border-t-emerald-400 mx-auto">
        
        <div className="grid w-full grid-cols-2 border-b dark:border-slate-800 text-center font-bold text-xs sm:text-sm tracking-wider uppercase">
          <button
            type="button"
            className={`py-3.5 sm:py-4 transition-all ${
              mode === "signin" 
                ? "border-b-2 border-slate-900 dark:border-emerald-400 text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50" 
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
            }`}
            onClick={() => handleModeSwitch("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`py-3.5 sm:py-4 transition-all ${
              mode === "signup" 
                ? "border-b-2 border-slate-900 dark:border-emerald-400 text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50" 
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
            }`}
            onClick={() => handleModeSwitch("signup")}
          >
            Sign Up
          </button>
        </div>

        <CardHeader className="text-center mt-4 mb-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {mode === "signin"
              ? "Enter your credentials to access your account"
              : "Get started with Debt-Optimiser today"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 sm:space-y-5 py-2">
            
            {error && (
              <div className="p-3 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-md">
                {error}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-1.5 transition-all duration-200">
                <Label htmlFor="name" className="text-xs sm:text-sm font-semibold dark:text-slate-200">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="h-10 sm:h-11 text-sm sm:text-base dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold dark:text-slate-200">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-10 sm:h-11 text-sm sm:text-base dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold dark:text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-10 sm:h-11 text-sm sm:text-base dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex-col space-y-4 pt-4 pb-6">
            
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 text-white disabled:opacity-70 transition-colors uppercase tracking-wider"
            >
              {isLoading 
                ? "Processing..." 
                : mode === "signin" ? "Sign In to Account" : "Register Account"}
            </Button>

            <div className="relative w-full py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors uppercase tracking-wider"
            >
              <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
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
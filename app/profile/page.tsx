"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import WhiteCard from "../../components/WhiteCard";

interface UserProfile {
  email?: string;
  displayName?: string;
  monthlyBudget?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    displayName: "",
    monthlyBudget: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      // Pre-populate with auth data immediately so the page isn't totally blank 
      // while waiting for Firestore
      setProfile((prev) => ({ 
        ...prev, 
        email: currentUser.email || "",
        displayName: prev.displayName || currentUser.displayName || ""
      }));

      // Fetch existing profile from Firestore
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile((prev) => ({
            ...prev,
            displayName: data.displayName || prev.displayName || "",
            monthlyBudget: data.monthlyBudget || 0,
          }));
        } else {
          // Optional: If it's a fresh signup and document hasn't populated yet,
          // create a safe minimal profile document now.
          await setDoc(docRef, {
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            monthlyBudget: 0,
            createdAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // CRITICAL FIX: Ensure loading state turns off even if 
        // the document doesn't exist yet or the fetch fails.
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === "monthlyBudget" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          email: profile.email,
          displayName: profile.displayName,
          monthlyBudget: profile.monthlyBudget,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-slate-500 text-center">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Profile Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
            Your Profile
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Manage your account settings and personal information
          </p>
        </div>

        {/* User Email Card */}
        <WhiteCard>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <p className="text-lg font-black text-slate-950 break-all">
              {profile.email}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              This is your registered email and cannot be changed from this page.
            </p>
          </div>
        </WhiteCard>

        {/* Profile Form Card */}
        <WhiteCard>
          <div className="space-y-5">
            {/* Display Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-xs font-black text-slate-500 uppercase tracking-wider block"
              >
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={profile.displayName || ""}
                onChange={handleInputChange}
                placeholder="Enter your display name"
                className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
              />
            </div>

            {/* Monthly Budget Field */}
            <div className="space-y-2">
              <label
                htmlFor="monthlyBudget"
                className="text-xs font-black text-slate-500 uppercase tracking-wider block"
              >
                Monthly Budget Goal ($)
              </label>
              <input
                id="monthlyBudget"
                name="monthlyBudget"
                type="number"
                value={profile.monthlyBudget || ""}
                onChange={handleInputChange}
                placeholder="Enter your monthly budget"
                className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-sm rounded-xl tracking-wider uppercase transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </WhiteCard>
      </main>
    </div>
  );
}
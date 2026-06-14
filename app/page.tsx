"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import DarkCard from "../components/DarkCard";
import WhiteCard from "../components/WhiteCard";

interface Debt {
  id: string;
  name: string;
  balance: number;
  limit: number;
  interest: number;
  color: string;
  text: string;
  userId: string;
}

const debtColors = ["bg-[#ff0000]", "bg-[#00e5ff]", "bg-[#00ffb7]"];
const debtTexts = ["text-[#ff0000]", "text-[#00e5ff]", "text-[#00ffb7]"];

export default function Dashboard() {
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    limit: "",
    interest: "",
  });
  const router = useRouter();

  // Auth check & fetch debts

  // Auth check & fetch debts
  useEffect(() => {
    let unsubscribeDebts: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        if (unsubscribeDebts) {
          unsubscribeDebts();
        }
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const debtsQuery = query(
        collection(db, "debts"),
        where("userId", "==", currentUser.uid)
      );

      unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
        const fetchedDebts: Debt[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const colorIndex = fetchedDebts.length % debtColors.length;
          fetchedDebts.push({
            id: doc.id,
            name: data.name,
            balance: data.balance,
            limit: data.limit,
            interest: data.interest,
            color: debtColors[colorIndex],
            text: debtTexts[colorIndex],
            userId: data.userId,
          });
        });
        setDebts(fetchedDebts);
        setIsLoading(false);
      });
    });

    return () => {
      if (unsubscribeDebts) unsubscribeDebts();
      unsubscribeAuth();
    };
  }, [router]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "debts"), {
        name: formData.name,
        balance: parseFloat(formData.balance),
        limit: parseFloat(formData.limit),
        interest: parseFloat(formData.interest),
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setFormData({ name: "", balance: "", limit: "", interest: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("Failed to add debt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-slate-500 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Main Content Header Banner */}
        <DarkCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Financial Roadmap</h1>
            <p className="text-slate-300 text-sm font-medium mt-1">Optimizing your path to financial freedom using real interest calculations.</p>
          </div>
          
          {/* Strategy Picker Toggles - Uses your accents */}
          <div className="bg-slate-900 p-1 rounded-xl flex self-start sm:self-center border border-slate-800">
            <button 
              onClick={() => setStrategy("avalanche")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${strategy === "avalanche" ? "bg-[#00e5ff] text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              AVALANCHE
            </button>
            <button 
              onClick={() => setStrategy("snowball")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${strategy === "snowball" ? "bg-[#00ffb7] text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              SNOWBALL
            </button>
          </div>
        </DarkCard>

        {/* 2-Column Responsive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Core Statistics Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Target Freedom Card */}
            <DarkCard className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Freedom Target</p>
                <p className="text-3xl font-black text-white tracking-tight">OCT 2028</p>
                <p className="text-xs text-[#00ffb7] font-bold flex items-center pt-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffb7] mr-1.5 animate-pulse" />
                  {strategy} Mode
                </p>
              </div>

              {/* Progress Ring with Cyan Accent */}
              <div className="relative flex items-center justify-center h-16 w-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#00e5ff]" strokeWidth="4" strokeDasharray="38, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-black text-white">38%</span>
              </div>
            </DarkCard>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Owed</span>
                <p className="text-2xl font-black text-slate-950 mt-1">$24,800</p>
              </WhiteCard>
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Interest Saved</span>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  <span className="text-[#00e5ff] bg-slate-950 px-2 py-0.5 rounded font-black">+$3,412</span>
                </p>
              </WhiteCard>
            </div>

            {/* Neon Add Button */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-[#00ffb7]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add New Account</span>
            </button>

          </div>

          {/* RIGHT: Active Debt Stack List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Debt Stack ({debts.length})</h2>
              <span className="text-xs text-white font-black bg-slate-950 px-2 py-0.5 rounded tracking-wide uppercase">Auto-Sorted</span>
            </div>

            <div className="space-y-3">
              {debts
                .sort((a, b) => strategy === "avalanche" ? b.interest - a.interest : a.balance - b.balance)
                .map((debt) => {
                  const percentagePaid = Math.round(((debt.limit - debt.balance) / debt.limit) * 100);
                  return (
                    <WhiteCard key={debt.id}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-lg text-slate-950 uppercase tracking-tight">{debt.name}</h3>
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-black bg-slate-950 rounded mt-1.5 ${debt.text}`}>
                            {debt.interest}% APR
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-slate-950">${debt.balance.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 font-bold">Limit: ${debt.limit.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Linear Progress Bar featuring the custom color accents */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border-2 border-slate-950">
                          <div className={`h-full ${debt.color} rounded-full transition-all duration-500`} style={{ width: `${percentagePaid}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-tight">
                          <span>{percentagePaid}% paid off</span>
                          <span className="text-slate-950">${(debt.limit - debt.balance).toLocaleString()} cleared</span>
                        </div>
                      </div>
                    </WhiteCard>
                  );
                })}
            </div>
          </div>

        </div>

        {/* Add Debt Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md">
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Add New Debt Account</h2>
                
                <form onSubmit={handleAddDebt} className="space-y-4">
                  {/* Account Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Credit Card, Student Loan"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
                    />
                  </div>

                  {/* Current Balance */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Current Balance ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      required
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
                    />
                  </div>

                  {/* Credit Limit / Total Loan */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Credit Limit / Total Loan ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      required
                      step="0.01"
                      value={formData.limit}
                      onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">APR Interest Rate (%)</label>
                    <input
                      type="number"
                      placeholder="0"
                      required
                      step="0.01"
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff] focus:ring-offset-0"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-xs rounded-lg tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Adding..." : "Add Account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </WhiteCard>
          </div>
        )}

      </main>
    </div>
  );
}
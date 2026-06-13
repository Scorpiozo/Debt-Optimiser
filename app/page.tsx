"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import DarkCard from "../components/DarkCard";
import WhiteCard from "../components/WhiteCard";

export default function Dashboard() {
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const debts = [
    { id: 1, name: "Chase Credit Card", balance: 4200, limit: 5000, interest: 22.4, color: "bg-[#ff0000]", text: "text-[#ff0000]" },
    { id: 2, name: "Federal Student Loan", balance: 12500, limit: 15000, interest: 5.8, color: "bg-[#00e5ff]", text: "text-[#00e5ff]" },
    { id: 3, name: "Car Loan", balance: 8100, limit: 12000, interest: 4.2, color: "bg-[#00ffb7]", text: "text-[#00ffb7]" },
  ];

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
            <button className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all flex items-center justify-center space-x-2">
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

      </main>
    </div>
  );
}
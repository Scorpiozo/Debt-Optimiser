"use client";

import React, { useState, useEffect } from "react";
import WhiteCard from "@/components/WhiteCard";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useRouter } from "next/navigation";

export default function PayoffPlansPage() {
  // 1. Real Firestore Data States
  const [totalDebt, setTotalDebt] = useState(0); 
  const [avgInterestRate, setAvgInterestRate] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);

  // 2. Calculator Modes & Inputs
  const [calcMode, setCalcMode] = useState<"date" | "payment">("date");
  const [targetDate, setTargetDate] = useState("");
  const [targetPayment, setTargetPayment] = useState<number | "">("");
  const [lumpSumBonus, setLumpSumBonus] = useState<number>(0);
  const [bonusMonth, setBonusMonth] = useState<string>("12");

  // Calculated Outputs
  const [requiredMonthly, setRequiredMonthly] = useState<number>(0);
  const [monthsRemaining, setMonthsRemaining] = useState<number>(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // The function that fires when they click the button
  // The upgraded function that handles both modes flawlessly
  const handleLockInStrategy = async () => {
    if (!auth.currentUser || totalDebt <= 0) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // 1. Determine the final payoff date string
      let finalTargetDate = targetDate;
      
      // If we are in payment mode, extract the final date from the simulation chart data
      if (calcMode === "payment" && chartData.length > 0) {
        // The simulation loop advances 'simDate' to the exact payoff month.
        // Let's calculate the YYYY-MM string based on months remaining from today
        const targetCompletionDate = new Date();
        targetCompletionDate.setMonth(targetCompletionDate.getMonth() + monthsRemaining);
        
        const year = targetCompletionDate.getFullYear();
        const month = String(targetCompletionDate.getMonth() + 1).padStart(2, "0");
        finalTargetDate = `${year}-${month}`;
      }
      
      // 2. Update their profile with the synchronized financial plan
      await updateDoc(userRef, {
        payoffStrategy: {
          mode: calcMode,
          targetDate: finalTargetDate, // Handles calculated dates perfectly now!
          targetPayment: calcMode === "payment" ? Number(targetPayment) : requiredMonthly,
          bonusAmount: lumpSumBonus,
          bonusMonth: bonusMonth,
          lockedAt: new Date().toISOString()
        }
      });

      router.push("/");

    } catch (error) {
      console.error("Error saving strategy:", error);
      alert("Failed to save strategy. Please try again.");
      setIsSaving(false);
    }
  };

  // Get current YYYY-MM to prevent "Time Travel"
  const today = new Date();
  const minMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // FEATURE 1: Fetch Real Firestore Data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "debts"), where("userId", "==", user.uid));
        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          let sum = 0;
          let weightedInterestSum = 0;
          
          snapshot.forEach(doc => {
            const data = doc.data();
            sum += data.balance;
            weightedInterestSum += (data.balance * data.interest);
          });
          
          setTotalDebt(sum);
          // Calculate weighted average interest rate
          setAvgInterestRate(sum > 0 ? (weightedInterestSum / sum) : 0);
          setIsLoading(false);
        });
        return () => unsubscribeSnap();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Default target date to 3 years from now if empty
  useEffect(() => {
    if (!targetDate) {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 3);
      setTargetDate(`${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}`);
    }
  }, [targetDate]);

  // FEATURE 2, 3 & 4: Master Simulation Engine
  useEffect(() => {
    if (totalDebt <= 0 || !targetDate) return;

    setWarningMessage(null);
    const monthlyRate = (avgInterestRate / 100) / 12;
    
    let basePayment = 0;
    let targetMonths = 0;

    // A. Determine Target Parameters based on Mode
    if (calcMode === "date") {
      const [targetYear, targetMonth] = targetDate.split("-").map(Number);
      targetMonths = (targetYear - today.getFullYear()) * 12 + (targetMonth - today.getMonth());
      if (targetMonths <= 0) targetMonths = 1;

      // Rough initial estimate for standard amortization
      if (monthlyRate === 0) {
        basePayment = totalDebt / targetMonths;
      } else {
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, targetMonths);
        const denominator = Math.pow(1 + monthlyRate, targetMonths) - 1;
        basePayment = totalDebt * (numerator / denominator);
      }
    } else {
      basePayment = Number(targetPayment) || 0;
      if (basePayment <= (totalDebt * monthlyRate) && basePayment > 0) {
        setWarningMessage("Payment is too low to cover monthly interest. Your debt will grow!");
        return;
      }
    }

    // B. Run Month-by-Month Simulation (Builds Chart & Exact Totals)
    let currentBalance = totalDebt;
    let simMonths = 0;
    let interestSum = 0;
    let newChartData = [];
    let simDate = new Date();

    // Push starting point
    newChartData.push({
      month: simDate.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
      balance: Math.round(currentBalance)
    });

    // Run loop until debt is $0 (cap at 360 months/30 years to prevent infinite loops)
    while (currentBalance > 0 && simMonths < 360) {
      simMonths++;
      simDate.setMonth(simDate.getMonth() + 1);
      
      const interestForMonth = currentBalance * monthlyRate;
      interestSum += interestForMonth;
      
      let actualPayment = basePayment;
      // Inject seasonal bonus if it's the correct month
      if (simDate.getMonth() + 1 === parseInt(bonusMonth)) {
        actualPayment += lumpSumBonus;
      }

      // If this is the final month, don't overpay
      if (currentBalance + interestForMonth < actualPayment) {
        actualPayment = currentBalance + interestForMonth;
      }

      currentBalance = currentBalance + interestForMonth - actualPayment;
      if (currentBalance < 0) currentBalance = 0;

      newChartData.push({
        month: simDate.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
        balance: Math.round(currentBalance)
      });
    }

    setRequiredMonthly(Math.round(basePayment));
    setMonthsRemaining(simMonths);
    setTotalInterestPaid(Math.round(interestSum));
    setChartData(newChartData);

  }, [calcMode, targetDate, targetPayment, totalDebt, avgInterestRate, lumpSumBonus, bonusMonth]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading your financial data...</div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-slate-950 pb-12 transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
            Goal-Based Payoff Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Configure target timelines or payments to simulate your path to financial freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="lg:col-span-2 space-y-5">
            <WhiteCard>
              
              {/* Feature 3: Calculator Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border-2 border-slate-950 mb-6">
                <button 
                  onClick={() => setCalcMode("date")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${calcMode === "date" ? "bg-emerald-400 text-slate-950 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"}`}
                >
                  Target Date
                </button>
                <button 
                  onClick={() => setCalcMode("payment")}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${calcMode === "payment" ? "bg-emerald-400 text-slate-950 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"}`}
                >
                  Target Payment
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Dynamic Primary Input based on Mode */}
                {calcMode === "date" ? (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">When do you want to be debt-free?</label>
                    <input 
                      type="month" 
                      min={minMonth} // Feature 2: Prevent Time Travel
                      value={targetDate} 
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">How much can you pay monthly?</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500"
                      value={targetPayment} 
                      onChange={(e) => setTargetPayment(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                )}

                {/* Seasonal Adjustments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Seasonal Injections (Annual Bonus / Tax Refund)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="e.g. $2,000"
                      value={lumpSumBonus || ""} 
                      onChange={(e) => setLumpSumBonus(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border-2 border-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <select 
                      value={bonusMonth} 
                      onChange={(e) => setBonusMonth(e.target.value)}
                      className="px-3 py-2 border-2 border-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="04">April (Tax)</option>
                      <option value="12">Dec (Bonus)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">This lump sum is auto-injected annually to crush down the principal timeline.</p>
                </div>
              </div>
            </WhiteCard>

            {/* FEATURE 4: Visual Payoff Chart */}
            <WhiteCard className="h-80 flex flex-col">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Payoff Trajectory</h2>
              <div className="flex-1 w-full min-h-0">
                {chartData.length > 0 && !warningMessage ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" tick={{fontSize: 10}} tickLine={false} minTickGap={30} stroke="#64748b" />
                      <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tick={{fontSize: 10}} tickLine={false} stroke="#64748b" />
                      <Tooltip 
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Balance"]}
                        contentStyle={{ borderRadius: '8px', border: '2px solid #0f172a', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                    {warningMessage || "Awaiting valid parameters..."}
                  </div>
                )}
              </div>
            </WhiteCard>

          </div>

          {/* Real-time Dynamic Display Output Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-950 text-white p-6 border-2 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(52,211,153,1)] space-y-6 sticky top-6">
              
              {warningMessage ? (
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm font-bold">
                  {warningMessage}
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
                      {calcMode === "date" ? "Required Monthly" : "Target Achieved By"}
                    </h3>
                    <p className="text-4xl font-black text-emerald-400 mt-1">
                      {calcMode === "date" ? (
                        `$${requiredMonthly.toLocaleString()}`
                      ) : (
                        chartData.length > 0 ? chartData[chartData.length - 1].month : "--"
                      )}
                      {calcMode === "date" && <span className="text-sm text-white font-medium">/mo</span>}
                    </p>
                  </div>

                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">Timeline:</span>
                      <span>{monthsRemaining} Months</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">Est. Interest:</span>
                      <span className="text-red-400">${totalInterestPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">Avg Interest Rate:</span>
                      <span>{avgInterestRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">Base Principal:</span>
                      <span>${totalDebt.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLockInStrategy}
                    disabled={isSaving || warningMessage !== null}
                    className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Lock In Strategy"}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
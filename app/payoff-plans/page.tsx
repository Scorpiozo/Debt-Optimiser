"use client";

import React, { useState, useEffect } from "react";
import WhiteCard from "@/components/WhiteCard";

export default function PayoffPlansPage() {
  // Mock data representing user's current debts fetched from Firestore
  const [totalDebt, setTotalDebt] = useState(24000); 
  const [avgInterestRate, setAvgInterestRate] = useState(18); // 18% APR

  // User Target Settings
  const [targetDate, setTargetDate] = useState("2027-12");
  const [lumpSumBonus, setLumpSumBonus] = useState<number>(0);
  const [bonusMonth, setBonusMonth] = useState<string>("12"); // Default: December

  // Calculated Outputs
  const [requiredMonthly, setRequiredMonthly] = useState<number>(0);
  const [monthsRemaining, setMonthsRemaining] = useState<number>(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);

  useEffect(() => {
    // 1. Calculate months between today and target date
    const today = new Date();
    const [targetYear, targetMonth] = targetDate.split("-").map(Number);
    
    let totalMonths = (targetYear - today.getFullYear()) * 12 + (targetMonth - today.getMonth());
    if (totalMonths <= 0) totalMonths = 1;
    setMonthsRemaining(totalMonths);

    // 2. Real-time simulation math (Amortization approximation)
    const monthlyRate = (avgInterestRate / 100) / 12;
    
    // Account for seasonal lump sum deductions distributed across the timeline
    const activeYears = Math.max(1, Math.ceil(totalMonths / 12));
    const totalBonusDeductions = lumpSumBonus * activeYears;
    const adjustedPrincipal = Math.max(0, totalDebt - totalBonusDeductions);

    let monthlyPayment = 0;
    let interestSum = 0;

    if (monthlyRate === 0) {
      monthlyPayment = adjustedPrincipal / totalMonths;
    } else {
      // Standard Amortization Formula: P * (r(1+r)^n) / ((1+r)^n - 1)
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
      const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
      monthlyPayment = adjustedPrincipal * (numerator / denominator);
      
      interestSum = (monthlyPayment * totalMonths) - adjustedPrincipal;
    }

    setRequiredMonthly(isNaN(monthlyPayment) ? 0 : Math.round(monthlyPayment));
    setTotalInterestPaid(isNaN(interestSum) || interestSum < 0 ? 0 : Math.round(interestSum));

  }, [targetDate, totalDebt, avgInterestRate, lumpSumBonus]);

  // Quick milestone progress check for UI celebration
  const mockPaidPercentage = 50; 

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-slate-950 pb-12 transition-colors duration-300">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
            Goal-Based Payoff Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Configure target timeline parameters and simulate repayment dynamics dynamically.
          </p>
        </div>

        {/* Milestone Celebration Banner */}
        {mockPaidPercentage >= 50 && (
          <div className="p-4 bg-emerald-400 border-2 border-slate-950 rounded-xl text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">Milestone Unlocked!</h3>
              <p className="text-xs font-semibold opacity-90">You have officially mapped strategy for over 50% of your total liability stack!</p>
            </div>
            <span className="text-2xl font-black">🎉</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="md:col-span-2 space-y-5">
            <WhiteCard>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Simulation Targets</h2>
              
              <div className="space-y-4">
                {/* Target Date Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">When do you want to be debt-free?</label>
                  <input 
                    type="month" 
                    value={targetDate} 
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-bold text-slate-950 focus:outline-none"
                  />
                </div>

                {/* Seasonal Adjustments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Seasonal Injections (Annual Bonus / Tax Refund)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="e.g. $2,000"
                      value={lumpSumBonus || ""} 
                      onChange={(e) => setLumpSumBonus(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border-2 border-slate-950 rounded-lg font-bold text-slate-950 focus:outline-none"
                    />
                    <select 
                      value={bonusMonth} 
                      onChange={(e) => setBonusMonth(e.target.value)}
                      className="px-3 py-2 border-2 border-slate-950 rounded-lg font-bold text-slate-950 bg-white focus:outline-none"
                    >
                      <option value="04">April (Tax)</option>
                      <option value="12">December (Bonus)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">This lump sum is auto-injected annually to crush down the principal timeline.</p>
                </div>
              </div>
            </WhiteCard>
          </div>

          {/* Real-time Dynamic Display Output Card */}
          <div className="md:col-span-1">
            <div className="bg-slate-950 text-white p-6 border-2 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] space-y-6 sticky top-6">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Required Monthly</h3>
                <p className="text-4xl font-black text-emerald-400 mt-1">${requiredMonthly}<span className="text-sm text-white font-medium">/mo</span></p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Timeline:</span>
                  <span>{monthsRemaining} Months</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Est. Interest:</span>
                  <span className="text-red-400">${totalInterestPaid}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Base Principal:</span>
                  <span>${totalDebt.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all">
                Lock In Strategy
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
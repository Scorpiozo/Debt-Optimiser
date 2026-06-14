"use client";
import WhiteCard from "../../components/WhiteCard";
import DarkCard from "../../components/DarkCard";

export default function AboutUsagePage() {
  return (
    <div className="pb-12 bg-[#faf4f0] min-h-screen transition-colors duration-300">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Hero Board */}
        <DarkCard className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-[#00e5ff] text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Engine Reference V2
            </span>
            <span className="text-xs font-black bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Live Production Spec
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            App Usage & Strategy Guide
          </h1>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            A transparent mechanical lookup detailing the sorting metrics, behavioral paradigms, and predictive simulation calculators tracking your real-time liquidation data.
          </p>
        </DarkCard>

        {/* The Two Strategy Methodology Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Avalanche Section */}
          <WhiteCard className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black bg-[#00e5ff] text-slate-950 px-2 py-0.5 rounded uppercase tracking-wide">
                  Method 1
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Math-First
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                Debt Avalanche
              </h2>
              <p className="text-slate-600 text-xs font-medium leading-relaxed">
                The objective mathematical champion. This routing scheme algorithmically targets liabilities carrying the highest Annual Percentage Rate (APR) first, keeping small balances running on minimum payments until the target apex node is wiped out.
              </p>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Sorting Execution Matrix:</p>
                <div className="mt-1 bg-slate-50 border border-slate-200 p-2 rounded text-xs font-mono font-bold text-slate-800 text-center">
                  Priority = Max(APR) → Sort: (b.interest - a.interest)
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-950 rounded-xl p-3 text-[11px] font-black text-[#00e5ff] uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚡ Key Core Metric: Minimizes long-term lifetime interest expenditure.
            </div>
          </WhiteCard>

          {/* Snowball Section */}
          <WhiteCard className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black bg-[#00ffb7] text-slate-950 px-2 py-0.5 rounded uppercase tracking-wide">
                  Method 2
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Behavior-First
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                Debt Snowball
              </h2>
              <p className="text-slate-600 text-xs font-medium leading-relaxed">
                The psychological performance champion. This strategy drops the interest rate entirely out of the sorting queue and ranks structural balances from lowest to highest, crushing low-principal lines to clear up rapid psychological wins.
              </p>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Sorting Execution Matrix:</p>
                <div className="mt-1 bg-slate-50 border border-slate-200 p-2 rounded text-xs font-mono font-bold text-slate-800 text-center">
                  Priority = Min(Balance) → Sort: (a.balance - b.balance)
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-950 rounded-xl p-3 text-[11px] font-black text-[#00ffb7] uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🎉 Key Core Metric: Maximizes momentum by reducing absolute account headcounts.
            </div>
          </WhiteCard>

        </div>

        {/* Core Simulation Engine Deep Dive */}
        <WhiteCard className="space-y-4">
          <div className="border-b-2 border-slate-100 pb-2">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
              Predictive Payoff Simulation Engine
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              How the <span className="text-emerald-500 font-black">PayoffPlansPage</span> loop structures forecasting computations:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-950/10 space-y-1">
              <h3 className="text-xs font-black text-slate-950 uppercase">1. Weighted Interest Real-Time Tracking</h3>
              <p className="text-slate-600 text-[11px] font-medium leading-normal">
                Instead of simple mathematical means, your live pipeline calculates an aggregate weighted average across all active account balances to drive the timeline while-loop:
              </p>
              <div className="pt-2 font-mono text-xs text-slate-800 font-bold text-center">
                Weighted Interest = Sum(Balance * Interest) / Sum(Balance)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-950/10 space-y-1">
              <h3 className="text-xs font-black text-slate-950 uppercase">2. Terminal Underpayment Safety Lock</h3>
              <p className="text-slate-600 text-[11px] font-medium leading-normal">
                When operating inside **Target Payment Mode**, if the user-defined baseline payment falls below the monthly compound interest accrual, the system blocks the calculation array to prevent execution runtime crashes:
              </p>
              <div className="pt-2 font-mono text-xs text-red-600 font-bold text-center">
                Target Payment &le; Total Debt * (Weighted Interest / 12 / 100)
              </div>
            </div>
          </div>
        </WhiteCard>

        {/* Technical Mathematical Compendium */}
        <WhiteCard className="space-y-4">
          <div className="border-b-2 border-slate-100 pb-2">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
              Dashboard Formula System
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              The arithmetic logic rules calculating your real-time visual cards:
            </p>
          </div>
          
          <div className="space-y-4">
            
            {/* Formula 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-950/10 space-y-2">
              <p className="font-black text-xs text-slate-950 uppercase tracking-wide flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-950 mr-2" />
                Individual Card Progress Ratio
              </p>
              <p className="text-slate-500 text-[11px] font-medium italic pl-4">
                Measures the precise chunk of principal capital cleared out on a specific account:
              </p>
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg font-bold select-all tracking-wide text-center">
                Progress % = ((Limit - Balance) / Limit) * 100
              </div>
            </div>

            {/* Formula 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-950/10 space-y-2">
              <p className="font-black text-xs text-slate-950 uppercase tracking-wide flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-950 mr-2" />
                Aggregated Portfolio Freedom Index
              </p>
              <p className="text-slate-500 text-[11px] font-medium italic pl-4">
                Powers the master neon radial dial resting on your left side panel bar:
              </p>
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg font-bold select-all tracking-wide text-center">
                Total Progress % = ((Sum of Limits - Sum of Balances) / Sum of Limits) * 100
              </div>
            </div>

            {/* Formula 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-950/10 space-y-2">
              <p className="font-black text-xs text-slate-950 uppercase tracking-wide flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-950 mr-2" />
                Amortized Payment Formulation (Target Date Mode)
              </p>
              <p className="text-slate-500 text-[11px] font-medium italic pl-4">
                The math calculating the required monthly injection balance to hit full liquidation within periods:
              </p>
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg font-bold select-all tracking-wide">
                <div className="text-center py-1">
                  Required Payment = Debt * (r * (1 + r)^n) / ((1 + r)^n - 1)
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-sans font-normal tracking-normal normal-case">
                  Where: <span className="text-white font-mono">Debt</span> = Total Debt Principal, <span className="text-white font-mono">r</span> = Monthly Interest Rate (AvgInterestRate / 12 / 100), and <span className="text-white font-mono">n</span> = Target Months Remaining.
                </div>
              </div>
            </div>

          </div>
        </WhiteCard>

      </main>
    </div>
  );
}
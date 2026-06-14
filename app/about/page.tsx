"use client";
import WhiteCard from "../../components/WhiteCard";
import DarkCard from "../../components/DarkCard";

export default function AboutUsagePage() {
  return (
    <div className="pb-12 bg-[#faf4f0] min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Hero Board */}
        <DarkCard className="space-y-2">
          <span className="text-xs font-black bg-[#00e5ff] text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
            Engine Reference
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            App Usage & Strategy Guide
          </h1>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            A transparent look into the core sorting metrics, behavioral theory, and mathematical systems running behind your automated roadmap dashboard.
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
                The objective mathematical champion. This protocol automatically prioritizes and routes your extra payments toward the account carrying the **highest interest rate (APR)**, regardless of the overall balance size.
              </p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-950 rounded-xl p-3 text-[11px] font-black text-[#00e5ff] uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚡ Key Core Metric: Minimizes lifetime historical interest expenditures.
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
                The psychological performance champion. This configuration filters and sequences your active liabilities strictly by size, aiming all extra fire-power at the **smallest dollar balance** first.
              </p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-950 rounded-xl p-3 text-[11px] font-black text-[#00ffb7] uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🎉 Key Core Metric: Generates rapid psychological victories to build momentum.
            </div>
          </WhiteCard>

        </div>

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
              <div className="bg-slate-950 text-white font-mono text-xs p-3 rounded-lg font-bold select-all tracking-wide">
                Progress % = ((Credit Limit - Current Balance) / Credit Limit) * 100
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
              <div className="bg-slate-950 text-white font-mono text-xs p-3 rounded-lg font-bold select-all tracking-wide">
                Total Progress % = ((Sum of All Limits - Sum of All Balances) / Sum of All Limits) * 100
              </div>
            </div>

          </div>
        </WhiteCard>

      </main>
    </div>
  );
}
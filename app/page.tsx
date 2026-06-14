"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import DarkCard from "../components/DarkCard";
import WhiteCard from "../components/WhiteCard";

interface Debt {
  id: string;
  name: string;
  balance: number;
  limit: number;
  interest: number;
  minimumPayment: number;
  dueDate: number;
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
  
  // Added payoffStrategy to the profile state
  const [userProfile, setUserProfile] = useState<{ 
    monthlyBudget?: number; 
    emergencyFund?: number;
    payoffStrategy?: any; 
  }>({});
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    limit: "",
    interest: "",
    minimumPayment: "",
    dueDate: "",
  });
  
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    balance: "",
    limit: "",
    interest: "",
    minimumPayment: "",
    dueDate: "",
  });
  
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const router = useRouter();

  // Auth check, profile retrieval, & live debt synchronization
  useEffect(() => {
    let unsubscribeDebts: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (unsubscribeDebts) unsubscribeDebts();
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Fetch Profile Data (Now including the locked strategy!)
      try {
        const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setUserProfile({
            monthlyBudget: parseFloat(profileData.monthlyBudget) || 0,
            emergencyFund: parseFloat(profileData.emergencyFund) || 0,
            payoffStrategy: profileData.payoffStrategy || null,
          });
        }
      } catch (err) {
        console.error("Error fetching user profile parameters:", err);
      }

      // Sync Debts Stream
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
            minimumPayment: data.minimumPayment || 0,
            dueDate: data.dueDate || 1,
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

  // --- DYNAMIC AGGREGATIONS & MATHEMATICS ---
  const totalOwed = debts.reduce((sum, item) => sum + item.balance, 0);
  const totalLimit = debts.reduce((sum, item) => sum + item.limit, 0);
  const totalMinimums = debts.reduce((sum, item) => sum + item.minimumPayment, 0);
  const totalCleared = Math.max(0, totalLimit - totalOwed);
  
  const aggregatePercentagePaid = totalLimit > 0 
    ? Math.round((totalCleared / totalLimit) * 100) 
    : 0;

  // Isolate current tactical strategy target card
  const sortedDebts = [...debts].sort((a, b) => 
    strategy === "avalanche" ? b.interest - a.interest : a.balance - b.balance
  );
  const targetDebt = sortedDebts[0];

  // Logic to determine active financial routing based on locked strategy or fallback budget
  const lockedStrategy = userProfile.payoffStrategy;
  const activeMonthlyCommitment = lockedStrategy?.targetPayment > 0 
    ? lockedStrategy.targetPayment 
    : (userProfile.monthlyBudget || 0);
    
  const actionableExtra = Math.max(0, activeMonthlyCommitment - totalMinimums);
  const freeTargetAccelerant = Math.max(0, (userProfile.monthlyBudget || 0) - totalMinimums);

  // Calculates time remaining based on their locked-in date (or falls back to estimation)
  const getTimelineDisplay = () => {
    if (totalOwed === 0) return "DEBT FREE 🎉";
    
    // If they locked in a strategy target date
    if (lockedStrategy?.targetDate) {
      const today = new Date();
      const [targetYear, targetMonth] = lockedStrategy.targetDate.split("-").map(Number);
      let totalMonths = (targetYear - today.getFullYear()) * 12 + (targetMonth - (today.getMonth() + 1));
      
      if (totalMonths <= 0) return "ACHIEVED";
      
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      return years > 0 ? `${years}Y ${remainingMonths}M` : `${remainingMonths} MONTHS`;
    }

    // Fallback if no strategy is locked
    if (activeMonthlyCommitment <= 0 || activeMonthlyCommitment <= totalMinimums) return "SET PLAN";
    const months = Math.ceil(totalOwed / activeMonthlyCommitment);
    if (months < 12) return `${months} MONTHS`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}Y ${remMonths}M` : `${years} YEARS`;
  };

  // Dynamic interest savings approach (approximate compound preservation estimation)
  const calculatedInterestSaved = debts.reduce((sum, item) => {
    return sum + (item.balance * (item.interest / 100) * 0.25);
  }, 0);

  const currentDayOfMonth = new Date().getDate();

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
        minimumPayment: parseFloat(formData.minimumPayment) || 0,
        dueDate: parseInt(formData.dueDate) || 1,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setFormData({ name: "", balance: "", limit: "", interest: "", minimumPayment: "", dueDate: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("Failed to add debt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingDebtId) return;

    setIsSubmitting(true);
    try {
      const debtRef = doc(db, "debts", editingDebtId);
      await updateDoc(debtRef, {
        name: editFormData.name,
        balance: parseFloat(editFormData.balance),
        limit: parseFloat(editFormData.limit),
        interest: parseFloat(editFormData.interest),
        minimumPayment: parseFloat(editFormData.minimumPayment) || 0,
        dueDate: parseInt(editFormData.dueDate) || 1,
        updatedAt: new Date().toISOString(),
      });
      setEditingDebtId(null);
      setEditFormData({ name: "", balance: "", limit: "", interest: "", minimumPayment: "", dueDate: "" });
    } catch (error) {
      console.error("Error updating debt:", error);
      alert("Failed to update debt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDebt = async () => {
    if (!user || !deletingDebtId) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "debts", deletingDebtId));
      setDeletingDebtId(null);
      setDeleteConfirmed(false);
    } catch (error) {
      console.error("Error deleting debt:", error);
      alert("Failed to delete debt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (debt: Debt) => {
    setEditingDebtId(debt.id);
    setEditFormData({
      name: debt.name,
      balance: debt.balance.toString(),
      limit: debt.limit.toString(),
      interest: debt.interest.toString(),
      minimumPayment: debt.minimumPayment.toString(),
      dueDate: debt.dueDate.toString(),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-slate-500 text-center font-bold">Loading dashboard stream...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header Dashboard Banner */}
        <DarkCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Financial Roadmap</h1>
            <p className="text-slate-300 text-sm font-medium mt-1">Optimizing your path to financial freedom using real interest calculations.</p>
          </div>
          
          {/* Strategy Picker Toggles */}
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

        {/* 2-Column Dashboard Grid Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Statistics Panel Stack */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Dynamic Calculated Target Freedom Box */}
            <DarkCard className="flex items-center justify-between border-t-4 border-t-[#00ffb7]">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {lockedStrategy ? "Locked Freedom Target" : "Est. Freedom Target"}
                </p>
                <p className="text-3xl font-black text-white tracking-tight">{getTimelineDisplay()}</p>
                <p className="text-xs text-[#00ffb7] font-bold flex items-center pt-1 uppercase">
                  {lockedStrategy?.targetDate ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffb7] mr-1.5" />
                      LOCKED: {new Date(lockedStrategy.targetDate + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 animate-pulse" />
                      UNLOCKED ESTIMATE
                    </>
                  )}
                </p>
              </div>

              {/* Progress Dial Widget */}
              <div className="relative flex items-center justify-center h-16 w-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="text-[#00e5ff] transition-all duration-500" 
                    strokeWidth="4" 
                    strokeDasharray={`${aggregatePercentagePaid}, 100`} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{aggregatePercentagePaid}%</span>
              </div>
            </DarkCard>

            {/* Quick Strategic Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Owed</span>
                <p className="text-2xl font-black text-slate-950 mt-1">${totalOwed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Min. Due: ${totalMinimums.toLocaleString()}/mo</p>
              </WhiteCard>
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Interest Saved</span>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  <span className="text-[#00e5ff] bg-slate-950 px-2 py-0.5 rounded font-black">
                    +${Math.round(calculatedInterestSaved).toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-slate-400 font-medium mt-2">Projected interest saved via execution</p>
              </WhiteCard>
            </div>

            {/* Dynamic Real-time Acceleration Engine Readout */}
            <WhiteCard className="space-y-3">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Accelerant Engine Status</p>
              <div className="text-xs font-bold text-slate-700 space-y-1.5 font-mono">
                <div className="flex justify-between"><span>Committed Plan:</span><span className="font-black text-slate-950">${activeMonthlyCommitment.toLocaleString()}</span></div>
                <div className="flex justify-between text-red-600"><span>[-] Minimums:</span><span>-${totalMinimums.toLocaleString()}</span></div>
                <div className="border-t border-slate-300 pt-1 flex justify-between text-slate-950 text-sm font-black">
                  <span>🔥 Target Boost:</span>
                  <span className="text-[#00ffb7] bg-slate-950 px-1.5 py-0.5 rounded font-mono">${actionableExtra.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-normal italic">
                {actionableExtra > 0 
                  ? `Based on your locked strategy, $${actionableExtra.toLocaleString()} of extra fire-power should be directly routed into your primary target account this month.`
                  : "Go to your Payoff Plans tab to map a target timeline and generate tactical boost capital."
                }
              </p>
            </WhiteCard>

            {/* Humanized Progress Summary Frame */}
            <WhiteCard>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Portfolio Progress</p>
              <p className="text-sm text-slate-700 font-bold mt-2">
                You have cleared <span className="text-[#00e5ff] font-black text-lg">${totalCleared.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span> of your total credit limits, representing <span className="text-[#00ffb7] font-black">{aggregatePercentagePaid}%</span> of your borrowing capacity.
              </p>
            </WhiteCard>

            {/* Neo-brutalist Input Action Launcher */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-[#00ffb7]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add New Account</span>
            </button>

          </div>

          {/* RIGHT: Active Account Queue Stack */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Real-time Focus Strategy Banner WITH EXACT MATH */}
            {targetDebt && debts.length > 0 && (
              <WhiteCard className="border-l-4 border-l-[#00e5ff] bg-slate-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">🎯</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider">This Month's Action Plan</p>
                      <span className="bg-slate-950 text-[#00ffb7] text-[10px] font-black px-2 py-0.5 rounded uppercase">{strategy} ACTIVE</span>
                    </div>
                    
                    <div className="mt-3 p-3 bg-white border-2 border-slate-200 rounded-lg shadow-sm">
                      <p className="text-sm font-bold text-slate-950 leading-relaxed">
                        1. Pay exact minimums across all your regular accounts (<span className="text-red-500">${(totalMinimums - targetDebt.minimumPayment).toLocaleString()}</span>).
                        <br/>
                        2. Take your target debt's minimum (<span className="text-slate-600">${targetDebt.minimumPayment.toLocaleString()}</span>) PLUS your available strategy boost (<span className="text-[#00e5ff]">${actionableExtra.toLocaleString()}</span>).
                        <br/>
                        3. Make a massive single payment of <span className="font-black text-lg text-slate-950 bg-emerald-100 px-1 rounded">${(targetDebt.minimumPayment + actionableExtra).toLocaleString()}</span> directly to <span className="font-black underline decoration-2 decoration-[#00e5ff]">{targetDebt.name}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </WhiteCard>
            )}

            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Debt Stack ({debts.length})</h2>
              <span className="text-xs text-white font-black bg-slate-950 px-2 py-0.5 rounded tracking-wide uppercase">Auto-Sorted</span>
            </div>

            {/* Interactive Loop */}
            <div className="space-y-3">
              {debts.length === 0 ? (
                <WhiteCard className="text-center py-12 border-dashed border-2">
                  <p className="font-bold text-slate-500 uppercase text-xs tracking-wider">No active debts registered.</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Click "Add New Account" on the left to initialize your dashboard metrics.</p>
                </WhiteCard>
              ) : (
                sortedDebts.map((debt) => {
                  const percentagePaid = debt.limit > 0 
                    ? Math.round(((debt.limit - debt.balance) / debt.limit) * 100) 
                    : 0;
                  
                  // Compute localized due-date urgency conditions
                  const daysUntilDue = debt.dueDate - currentDayOfMonth;
                  const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 5;

                  return (
                    <WhiteCard key={debt.id} className={targetDebt?.id === debt.id ? "border-2 border-slate-950 ring-4 ring-[#00e5ff]/20" : ""}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-slate-950 uppercase tracking-tight">{debt.name}</h3>
                            {targetDebt?.id === debt.id && (
                              <span className="text-[9px] bg-slate-950 text-[#00ffb7] font-black px-1.5 py-0.5 rounded uppercase">TARGET</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-black bg-slate-950 rounded ${debt.text}`}>
                              {debt.interest}% APR
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border px-1.5 py-0.5 rounded uppercase">
                              Min: ${debt.minimumPayment}/mo
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-xl text-slate-950">${debt.balance.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 font-bold">Limit: ${debt.limit.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Linear Utilization Canvas */}
                      <div className="space-y-1.5 mb-3">
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border-2 border-slate-950">
                          <div className={`h-full ${debt.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, percentagePaid))}%` }} />
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-tight">
                          <span>{percentagePaid}% paid off</span>
                          <span className="text-slate-950">${Math.max(0, debt.limit - debt.balance).toLocaleString()} cleared</span>
                        </div>
                      </div>

                      {/* Action Interface Row with Real-Time Urgency Monitoring */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          {isUrgent ? (
                            <span className="bg-[#ff0000] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                              Due in {daysUntilDue} Days! ⚠️
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wide">
                              🗓️ Monthly Due Day: <span className="text-slate-700 font-black">{debt.dueDate}th</span>
                            </span>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => openEditModal(debt)}
                            className="font-black text-slate-500 hover:text-slate-950 uppercase text-[11px] tracking-wider underline decoration-2 decoration-[#00e5ff]"
                          >
                            Edit parameters
                          </button>
                          <button
                            onClick={() => setDeletingDebtId(debt.id)}
                            className="font-black text-red-500 hover:text-red-700 uppercase text-[11px] tracking-wider underline decoration-2 decoration-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </WhiteCard>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Add Debt Modal Overlay Canvas */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md">
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Add New Debt Account</h2>
                
                <form onSubmit={handleAddDebt} className="space-y-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Chase Sapphire, Car Loan"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Current Balance ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        required
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Credit Limit ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        required
                        step="0.01"
                        value={formData.limit}
                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">APR Rate (%)</label>
                      <input
                        type="number"
                        placeholder="19.99"
                        required
                        step="0.01"
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Minimum Payment ($)</label>
                      <input
                        type="number"
                        placeholder="35.00"
                        required
                        step="0.01"
                        value={formData.minimumPayment}
                        onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Monthly Payment Due Day (1-31)</label>
                    <input
                      type="number"
                      placeholder="15"
                      required
                      min="1"
                      max="31"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-xs rounded-lg tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all disabled:opacity-50"
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

        {/* Edit Debt Modal Overlay Canvas */}
        {editingDebtId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md">
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Edit Debt Account</h2>
                
                <form onSubmit={handleEditDebt} className="space-y-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Account Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Current Balance ($)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={editFormData.balance}
                        onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Credit Limit ($)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={editFormData.limit}
                        onChange={(e) => setEditFormData({ ...editFormData, limit: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">APR Rate (%)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={editFormData.interest}
                        onChange={(e) => setEditFormData({ ...editFormData, interest: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Minimum Payment ($)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={editFormData.minimumPayment}
                        onChange={(e) => setEditFormData({ ...editFormData, minimumPayment: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Due Day (1-31)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="31"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-950 rounded-lg font-medium text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00e5ff]"
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-xs rounded-lg tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:shadow-none transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDebtId(null)}
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

        {/* Double Safety Lock Delete Confirmation Modal */}
        {deletingDebtId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md border-4 border-red-500 shadow-[4px_4px_0px_0px_#ef4444]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <h2 className="text-xl font-black text-red-600 uppercase tracking-tight">Danger Control Lock</h2>
                </div>
                
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  Are you absolutely sure you want to delete this asset row? This action erases the historical metric timeline from our live data engine sync parameters.
                </p>

                {!deleteConfirmed ? (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setDeleteConfirmed(true)}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 border-2 border-slate-950 text-white font-black text-xs rounded-lg tracking-wider uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Yes, Delete Permanently
                    </button>
                    <button
                      onClick={() => setDeletingDebtId(null)}
                      className="flex-1 py-2 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase transition-all"
                    >
                      Abort
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-red-600 font-black uppercase tracking-wider animate-pulse">
                      🚨 Final Safety Confirmation. Second click is destructive.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteDebt}
                        disabled={isSubmitting}
                        className="flex-1 py-2 bg-red-700 hover:bg-red-800 border-2 border-slate-950 text-white font-black text-xs rounded-lg tracking-wider uppercase transition-all disabled:opacity-50 font-bold"
                      >
                        {isSubmitting ? "Purging Document..." : "Confirm & Destroy"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmed(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-2 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase transition-all disabled:opacity-50"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </WhiteCard>
          </div>
        )}

      </main>
    </div>
  );
}
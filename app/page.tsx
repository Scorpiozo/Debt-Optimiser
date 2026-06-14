"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    balance: "",
    limit: "",
    interest: "",
  });
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const router = useRouter();

  // Auth check & fetch debts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Set up Firestore listener for user-specific debts
      const debtsQuery = query(
        collection(db, "debts"),
        where("userId", "==", currentUser.uid)
      );

      const unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
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

      return () => unsubscribeDebts();
    });

    return () => unsubscribe();
  }, [router]);

  // --- DYNAMIC AGGREGATIONS ---
  const totalOwed = debts.reduce((sum, item) => sum + item.balance, 0);
  const totalLimit = debts.reduce((sum, item) => sum + item.limit, 0);
  const totalCleared = Math.max(0, totalLimit - totalOwed);
  
  // Compute total portfolio payoff percentage safely
  const aggregatePercentagePaid = totalLimit > 0 
    ? Math.round((totalCleared / totalLimit) * 100) 
    : 0;

  // Get the current target debt based on strategy
  const sortedDebts = [...debts].sort((a, b) => 
    strategy === "avalanche" ? b.interest - a.interest : a.balance - b.balance
  );
  const targetDebt = sortedDebts[0];

  // Simple placeholder logic for date calculations
  const estimatedFreedomTarget = totalOwed > 0 ? "OCT 2028" : "DEBT FREE";

  // Mock static calculation value for secondary block metric
  const projectedInterestSaved = totalOwed > 0 ? 3412 : 0;

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
        updatedAt: new Date().toISOString(),
      });
      setEditingDebtId(null);
      setEditFormData({ name: "", balance: "", limit: "", interest: "" });
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
        
        {/* Main Content Header Banner */}
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

        {/* 2-Column Responsive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Core Statistics Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Target Freedom Card */}
            <DarkCard className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Freedom Target</p>
                <p className="text-3xl font-black text-white tracking-tight">{estimatedFreedomTarget}</p>
                <p className="text-xs text-[#00ffb7] font-bold flex items-center pt-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffb7] mr-1.5 animate-pulse" />
                  {strategy} Mode
                </p>
              </div>

              {/* Dynamic Progress Ring */}
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Owed</span>
                <p className="text-2xl font-black text-slate-950 mt-1">${totalOwed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-400 font-medium mt-2">Across all your registered accounts</p>
              </WhiteCard>
              <WhiteCard>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Interest Saved</span>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  <span className="text-[#00e5ff] bg-slate-950 px-2 py-0.5 rounded font-black">
                    +${projectedInterestSaved.toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-slate-400 font-medium mt-2">Projected from strategic payoff</p>
              </WhiteCard>
            </div>

            {/* Humanized Progress Metric */}
            <WhiteCard>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Portfolio Progress</p>
              <p className="text-sm text-slate-700 font-bold mt-2">
                You have cleared <span className="text-[#00e5ff] font-black text-lg">${totalCleared.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span> of your total credit limits, representing <span className="text-[#00ffb7] font-black">{aggregatePercentagePaid}%</span> of your borrowing capacity.
              </p>
            </WhiteCard>

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
            {/* Advisory Banner */}
            {targetDebt && debts.length > 0 && (
              <WhiteCard className="border-l-4 border-l-[#00e5ff] bg-slate-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Current Target</p>
                    <p className="text-sm font-bold text-slate-950 mt-1">
                      Focus all extra payments on <span className="font-black text-[#00e5ff]">{targetDebt.name}</span> to optimize the <span className="font-black text-[#00ffb7]uppercase">{strategy}</span> strategy.
                    </p>
                  </div>
                </div>
              </WhiteCard>
            )}

            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Debt Stack ({debts.length})</h2>
              <span className="text-xs text-white font-black bg-slate-950 px-2 py-0.5 rounded tracking-wide uppercase">Auto-Sorted</span>
            </div>

            <div className="space-y-3">
              {debts.length === 0 ? (
                <WhiteCard className="text-center py-12 border-dashed border-2">
                  <p className="font-bold text-slate-500 uppercase text-xs tracking-wider">No active debts registered.</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Click "Add New Account" on the left to initialize your dashboard metrics.</p>
                </WhiteCard>
              ) : (
                debts
                  .sort((a, b) => strategy === "avalanche" ? b.interest - a.interest : a.balance - b.balance)
                  .map((debt) => {
                    const percentagePaid = debt.limit > 0 
                      ? Math.round(((debt.limit - debt.balance) / debt.limit) * 100) 
                      : 0;
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
                        
                        {/* Linear Progress Bar */}
                        <div className="space-y-1.5 mb-3">
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border-2 border-slate-950">
                            <div className={`h-full ${debt.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, percentagePaid))}%` }} />
                          </div>
                          <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-tight">
                            <span>{percentagePaid}% paid off</span>
                            <span className="text-slate-950">${Math.max(0, debt.limit - debt.balance).toLocaleString()} cleared</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          <button
                            onClick={() => openEditModal(debt)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingDebtId(debt.id)}
                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 border border-red-400 text-red-700 font-black text-xs rounded-lg tracking-wider uppercase transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </WhiteCard>
                    );
                  })
              )}
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

        {/* Edit Debt Modal */}
        {editingDebtId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md">
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Edit Debt Account</h2>
                
                <form onSubmit={handleEditDebt} className="space-y-4">
                  {/* Account Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Credit Card, Student Loan"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
                      value={editFormData.balance}
                      onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
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
                      value={editFormData.limit}
                      onChange={(e) => setEditFormData({ ...editFormData, limit: e.target.value })}
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
                      value={editFormData.interest}
                      onChange={(e) => setEditFormData({ ...editFormData, interest: e.target.value })}
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

        {/* Delete Confirmation Modal */}
        {deletingDebtId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <WhiteCard className="w-full max-w-md border-2 border-red-400">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <h2 className="text-xl font-black text-red-700 uppercase tracking-tight">Delete Account?</h2>
                </div>
                
                <p className="text-sm text-slate-700 font-medium">
                  This action will permanently remove this debt account from your dashboard. This cannot be undone.
                </p>

                {!deleteConfirmed ? (
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setDeleteConfirmed(true)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 border-2 border-red-600 text-white font-black text-xs rounded-lg tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(220,38,38,0.5)] hover:shadow-none transition-all"
                    >
                      Delete Permanently
                    </button>
                    <button
                      onClick={() => setDeletingDebtId(null)}
                      className="flex-1 py-2 bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 font-black text-xs rounded-lg tracking-wider uppercase transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                    <p className="text-xs text-red-700 font-black uppercase tracking-wider">This is your final confirmation.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteDebt}
                        disabled={isSubmitting}
                        className="flex-1 py-2 bg-red-700 hover:bg-red-800 border-2 border-red-700 text-white font-black text-xs rounded-lg tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Deleting..." : "Confirm Delete"}
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
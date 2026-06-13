import React from "react";

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DarkCard({ children, className = "" }: DarkCardProps) {
  return (
    <div className={`bg-slate-950 p-6 rounded-2xl shadow-md border border-slate-900 ${className}`}>
      {children}
    </div>
  );
}
import React from "react";

interface WhiteCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function WhiteCard({ children, className = "" }: WhiteCardProps) {
  return (
    <div className={`bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] transition-transform hover:translate-y-[-2px] ${className}`}>
      {children}
    </div>
  );
}
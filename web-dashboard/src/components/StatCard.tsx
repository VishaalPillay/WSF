import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "warning";
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  variant = "default" 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "border-[#fb7185]/30 bg-[#fb7185]/10 text-[#fb7185] shadow-[0_0_15px_rgba(251,113,133,0.1)]";
      case "warning":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500";
      default:
        return "border-white/10 bg-[#18181b]/60 text-white backdrop-blur-md";
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${getVariantStyles()} p-5 backdrop-blur-md min-w-[200px] transition-all hover:bg-[#18181b]/80`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
            {label}
          </div>
          <div className="text-4xl font-light tracking-tight font-inter">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-[#fb7185]/20' : 'bg-white/5'}`}>
            <Icon className={`w-5 h-5 ${variant === 'danger' ? 'text-[#fb7185]' : 'text-[#22d3ee]'}`} />
          </div>
        )}
      </div>
      
      {/* Decorator Line */}
      <div className={`absolute bottom-0 left-0 h-1 w-full ${
        variant === 'danger' 
          ? 'bg-gradient-to-r from-[#fb7185] to-transparent' 
          : 'bg-gradient-to-r from-[#22d3ee] to-transparent'
      } opacity-20`} />
    </div>
  );
};
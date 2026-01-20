import React from "react";
import { MapPin, Clock, AlertTriangle } from "lucide-react";

interface IncidentRowProps {
  id: string;
  displayName: string;
  location: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  description?: string;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

export const IncidentRow: React.FC<IncidentRowProps> = ({
  id,
  displayName,
  location,
  timestamp,
  severity,
  description,
  isSelected = false,
  onClick,
}) => {
  const getSeverityColor = (s: string) => {
    switch (s) {
      case "high": return "text-[#fb7185] bg-[#fb7185]/10 border-[#fb7185]/20 shadow-[0_0_10px_rgba(251,113,133,0.2)]";
      case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-zinc-400 bg-zinc-800/50 border-white/5";
    }
  };

  return (
    <div
      onClick={() => onClick?.(id)}
      className={`group relative p-4 mb-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "bg-[#22d3ee]/10 border-[#22d3ee]/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          : "bg-[#18181b]/40 border-white/5 hover:border-white/10 hover:bg-[#18181b]/80"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${
                severity === 'high' ? 'bg-[#fb7185] animate-pulse' : 'bg-emerald-400'
            }`} />
            <h3 className="font-medium text-sm text-zinc-100 group-hover:text-white transition-colors">
                {displayName}
            </h3>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono tracking-wide">{timestamp}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
        <MapPin className="w-3 h-3 text-zinc-600" />
        {location}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${getSeverityColor(severity)}`}>
            {severity} Priority
        </span>
        {severity === 'high' && (
            <AlertTriangle className="w-4 h-4 text-[#fb7185]" />
        )}
      </div>
      
      {description && (
        <div className="mt-2 text-xs text-zinc-500 pl-2 border-l border-white/10">
            {description}
        </div>
      )}
    </div>
  );
};
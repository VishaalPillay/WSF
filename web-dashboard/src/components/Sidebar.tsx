import React from "react";
import {
  Map,
  Settings,
} from "lucide-react";

interface SidebarProps {
  active?: string;
  onSelect?: (id: string) => void;
}

const items = [
  { id: "command_center", icon: Map, label: "Command Center" },
  { id: "system_logs", icon: Settings, label: "System Logs" },
];

export const Sidebar: React.FC<SidebarProps> = ({ active = "command_center", onSelect }) => {
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-20 flex flex-col items-center py-8 gap-8 z-50 glass-panel transition-all duration-300">
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
        <div className="w-3 h-3 bg-[#00F0FF] rounded-full shadow-[0_0_10px_#00F0FF]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              className="group relative flex items-center justify-center w-12 h-12 transition-all duration-300"
            >
              {/* Active Glow Backdrop */}
              {isActive && (
                <div className="absolute inset-0 bg-[#EE6E4D]/20 rounded-xl blur-md" />
              )}

              <div
                className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${isActive
                  ? "text-[#EE6E4D]"
                  : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
              >
                <Icon strokeWidth={isActive ? 2 : 1.5} className="w-6 h-6" />
              </div>

              {/* Active Dot Indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#EE6E4D] rounded-l-full shadow-[0_0_10px_#EE6E4D]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Bottom Action */}
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center">
          <span className="text-xs font-bold text-zinc-400">SA</span>
        </div>
      </div>
    </aside>
  );
};

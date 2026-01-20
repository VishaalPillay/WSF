import React, { useState } from 'react';
import MapView from './MapView';
import { Map, Shield, Users } from 'lucide-react';

// Minimal Button Component
const NavButton = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${active
      ? 'bg-[#1A0505] text-[#FF4D4D] border border-[#FF4D4D]/30 shadow-[0_0_15px_rgba(255,77,77,0.15)]'
      : 'text-[#444] hover:text-[#EDEDED] hover:bg-[#111]'
      }`}
  >
    {icon}
  </button>
);

export default function TacticalDashboard() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="h-screen w-screen grid grid-cols-[90px_1fr] bg-[#050505] overflow-hidden">
      <aside className="border-r border-[#222] bg-[#0A0A0A] flex flex-col items-center py-8 z-50 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4D4D] to-[#990000] shadow-[0_0_30px_rgba(255,0,0,0.4)] mb-12 flex items-center justify-center">
          <span className="font-bold text-black text-xs">CMD</span>
        </div>

        <nav className="flex flex-col gap-8 w-full px-4">
          <NavButton icon={<Map size={24} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          <NavButton icon={<Shield size={24} />} active={activeTab === 'patrol'} onClick={() => setActiveTab('patrol')} />
          <NavButton icon={<Users size={24} />} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        </nav>
      </aside>

      <main className="relative h-full w-full">
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>

        <div className="absolute top-6 right-6 z-10 w-96 flex flex-col gap-4 pointer-events-none">
          <div className="neo-glass p-4 rounded-xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              <span className="text-xs font-mono text-[#00F0FF] tracking-widest">SYSTEM ONLINE</span>
            </div>
            <span className="text-xs text-[#666] font-mono">V.2.0.4</span>
          </div>
        </div>
      </main>
    </div>
  );
}

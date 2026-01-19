import React from "react";
import { ShieldCheck, Zap, Radio } from "lucide-react";

interface Responder {
  id: string;
  name: string;
  status: "Available" | "En-Route";
  location: string;
}

const mockResponders: Responder[] = [
  { id: "unit-1", name: "Police Unit 01", status: "Available", location: "Sector 5" },
  { id: "unit-2", name: "Police Unit 02", status: "En-Route", location: "Sector 9" },
  { id: "unit-3", name: "Security Team A", status: "Available", location: "Sector 2" },
];

export const RespondersList: React.FC = () => {
  return (
    <div className="absolute top-20 left-32 z-10 w-80 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-light text-white tracking-wide">ACTIVE RESPONDERS</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Police & Security Units</p>
      </div>
      <div className="flex flex-col">
        {mockResponders.map((responder) => (
          <div key={responder.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
            <div className={`p-2 rounded-lg ${responder.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {responder.status === "Available" ? <ShieldCheck className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-white">{responder.name}</p>
              <p className="text-sm text-zinc-400">{responder.location}</p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-xs font-bold uppercase ${responder.status === 'Available' ? 'text-green-400' : 'text-yellow-400'}`}>
                {responder.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
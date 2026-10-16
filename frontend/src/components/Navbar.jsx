import React from 'react';
import { Flame, ShieldCheck, Wallet, ExternalLink, Activity, Satellite, Sparkles, MapPin } from 'lucide-react';

export default function Navbar({ 
  walletAddress, 
  isConnected, 
  onConnect, 
  onDisconnect, 
  activeRegion, 
  onChangeRegion, 
  onOpenWorkflow 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Hackathon / Mitacs Tag */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 shadow-lg shadow-orange-500/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Heat<span className="text-amber-400">Lens</span></span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">x402 Oracle</span>
                <span className="hidden sm:inline-block rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">Mitacs GRI 2027</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Satellite Earth Observation & Climate Equity • <span className="text-cyan-400 font-medium">Rohit Singh</span>
              </p>
            </div>
          </div>

          {/* Mobile Region Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenWorkflow}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400"
            >
              <Satellite className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center: Dual Region Selector & Workflow Trigger */}
        <div className="flex items-center gap-2.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
          <button
            onClick={() => onChangeRegion('delhi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeRegion === 'delhi'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇮🇳</span>
            <span>Delhi Heat Equity</span>
          </button>

          <button
            onClick={() => onChangeRegion('canada')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeRegion === 'canada'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇨🇦</span>
            <span>Mitacs Smog (#53438)</span>
          </button>

          {/* Workflow Architecture Button */}
          <button
            onClick={onOpenWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 transition shadow-sm"
          >
            <Satellite className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">System Workflow</span>
          </button>
        </div>

        {/* Right Badges & Wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono">Algorand AVM</span>
            </div>
            <a 
              href="https://lora.algokit.io/testnet" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition text-[11px]"
            >
              <span>Lora</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-mono font-medium text-emerald-400">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
                <p className="text-[10px] text-slate-400">Pera Testnet</p>
              </div>
              <button 
                onClick={onDisconnect}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnect}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 transition"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

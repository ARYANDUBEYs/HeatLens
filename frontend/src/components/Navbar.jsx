import React from 'react';
import { Flame, ShieldCheck, Wallet, ExternalLink, Activity } from 'lucide-react';

export default function Navbar({ walletAddress, isConnected, onConnect, onDisconnect }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        
        {/* Brand & Hackathon Tag */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 shadow-lg shadow-orange-500/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Heat<span className="text-amber-400">Lens</span></span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">x402 Oracle</span>
            </div>
            <p className="text-xs text-slate-400">Urban Heat & Air Equity Mapper • <span className="text-emerald-400 font-medium">Build With Bharat 2.0 (NIT Delhi)</span></p>
          </div>
        </div>

        {/* Center Live Badges */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Algorand TestNet</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>GoPlausible Facilitator</span>
          </div>
          <a 
            href="https://lora.algokit.io/testnet" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition"
          >
            <span>Lora Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-mono font-medium text-emerald-400">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
                <p className="text-[10px] text-slate-400">Pera Testnet Wallet</p>
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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 transition"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Pera Wallet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

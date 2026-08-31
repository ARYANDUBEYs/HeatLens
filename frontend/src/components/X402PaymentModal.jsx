import React, { useState } from 'react';
import { ShieldAlert, DollarSign, CheckCircle2, ExternalLink, Sparkles, Lock, ArrowRight } from 'lucide-react';

export default function X402PaymentModal({ isOpen, onClose, invoice, onApprove, isProcessing }) {
  if (!isOpen || !invoice) return null;

  const price = invoice.payment_details?.price || '$0.005 USDC';
  const network = invoice.payment_details?.network || 'Algorand Testnet (CAIP-2)';
  const facilitator = invoice.payment_details?.facilitator_url || 'https://facilitator.goplausible.xyz';
  const invoiceId = invoice.payment_details?.invoice_id || 'INV_' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-700 bg-slate-900/95 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-amber-400">HTTP 402</span>
                <span className="text-xs text-slate-400">• Payment Required</span>
              </div>
              <h3 className="text-base font-bold text-white">x402 Agentic Micro-Payment</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Protocol Details */}
        <div className="my-5 space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            {invoice.message || 'Accessing granular satellite thermal metrics & NDMA Heat Action Plan simulations requires an automated on-chain micro-settlement on Algorand.'}
          </p>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Required Amount:</span>
              <span className="font-mono font-bold text-base text-emerald-400">{price}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-900 pt-2.5">
              <span className="text-slate-400">Blockchain Network:</span>
              <span className="font-mono text-slate-200">Algorand TestNet</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-900 pt-2.5">
              <span className="text-slate-400">Settlement Facilitator:</span>
              <span className="font-mono text-cyan-400">GoPlausible (x402-avm)</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-900 pt-2.5">
              <span className="text-slate-400">Invoice ID:</span>
              <span className="font-mono text-slate-400">{invoiceId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
            <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Verifiable in 3.2 seconds on <b>Lora Algorand Explorer</b> with zero middleman fees.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Signing via Pera...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Sign & Settle on Algorand</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

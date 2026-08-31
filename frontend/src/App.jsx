import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LayerControls from './components/LayerControls';
import MapView from './components/MapView';
import WardDrawer from './components/WardDrawer';
import X402PaymentModal from './components/X402PaymentModal';
import { fetchWardsSummary, requestWardAudit, requestHapSimulation } from './services/api';
import { AlertTriangle, Flame, ShieldCheck, Sparkles, Building2, Users } from 'lucide-react';

export default function App() {
  const [geoData, setGeoData] = useState(null);
  const [activeLayer, setActiveLayer] = useState('priority');
  const [selectedWard, setSelectedWard] = useState(null);
  
  // Wallet State
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('7K2N...ALGO');

  // x402 Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'AUDIT' or 'HAP'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Audited & Simulation Results
  const [auditData, setAuditData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [isSimulatingHap, setIsSimulatingHap] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchWardsSummary();
      setGeoData(data);
      // Default to Seelampur (Highest Contrast Ward)
      if (data && data.features && data.features.length > 0) {
        setSelectedWard(data.features[0].properties);
      }
    }
    loadData();
  }, []);

  const handleConnectWallet = () => {
    // Simulated Pera Wallet Connection for Instant Live Demo
    setIsConnected(true);
    setWalletAddress('ALGO_7X402_HEATLENS_DEMO_WALLET_TESTNET_99B');
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
  };

  // Trigger x402 Audit
  const handleRequestAudit = async (wardId) => {
    const res = await requestWardAudit(wardId);
    if (res.is402) {
      setCurrentInvoice(res.invoice);
      setPendingAction({ type: 'AUDIT', wardId });
      setPaymentModalOpen(true);
    } else {
      setAuditData(res.data);
    }
  };

  // Trigger x402 HAP Simulation
  const handleSimulateHap = async (budgetLakhs) => {
    if (!selectedWard) return;
    setIsSimulatingHap(true);
    const res = await requestHapSimulation(selectedWard.ward_id, budgetLakhs);
    setIsSimulatingHap(false);

    if (res.is402) {
      setCurrentInvoice(res.invoice);
      setPendingAction({ type: 'HAP', wardId: selectedWard.ward_id, budgetLakhs });
      setPaymentModalOpen(true);
    } else {
      setSimulationData(res.data);
    }
  };

  // Approve x402 Payment & Sign on Algorand Testnet
  const handleApprovePayment = async () => {
    setIsProcessingPayment(true);

    // Simulate Algorand Testnet Block Settlement (3.2 seconds)
    setTimeout(async () => {
      const mockSignature = 'SIG_ALGO_AVM_' + Math.random().toString(36).substring(2, 12).toUpperCase();

      if (pendingAction.type === 'AUDIT') {
        const res = await requestWardAudit(pendingAction.wardId, mockSignature);
        setAuditData(res.data);
      } else if (pendingAction.type === 'HAP') {
        const res = await requestHapSimulation(pendingAction.wardId, pendingAction.budgetLakhs, mockSignature);
        setSimulationData(res.data);
      }

      setIsProcessingPayment(false);
      setPaymentModalOpen(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-100">
      
      {/* 1. Header Navbar */}
      <Navbar 
        walletAddress={walletAddress}
        isConnected={isConnected}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {/* 2. Main Dashboard */}
      <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full">
        
        {/* Top Summary Banner */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Delhi NCR Microclimate Equity Oracle</h2>
            </div>
            <p className="text-xs text-slate-400">
              Uncovering hidden <b>8°C – 10°C thermal burdens</b> & extreme AQI disparities across informal settlements.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Max LST Recorded</p>
              <p className="font-bold text-rose-400 text-sm">45.2°C</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Inequality Gap</p>
              <p className="font-bold text-amber-400 text-sm">+10.6°C</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Oracle Protocol</p>
              <p className="font-bold text-emerald-400 text-sm">x402 (AVM)</p>
            </div>
          </div>
        </div>

        {/* Layer Controls */}
        <LayerControls activeLayer={activeLayer} setActiveLayer={setActiveLayer} />

        {/* GIS Map & Drawer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
          
          {/* Left: Leaflet Interactive GIS Map (8 cols) */}
          <div className="lg:col-span-8 h-full">
            <MapView 
              geoData={geoData} 
              activeLayer={activeLayer}
              selectedWard={selectedWard}
              onSelectWard={(wardProps) => {
                setSelectedWard(wardProps);
                setAuditData(null);
                setSimulationData(null);
              }}
            />
          </div>

          {/* Right: Ward Details & x402 Action Drawer (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <WardDrawer 
              selectedWard={selectedWard}
              onClose={() => setSelectedWard(null)}
              onRequestAudit={handleRequestAudit}
              isAuditing={isProcessingPayment && pendingAction?.type === 'AUDIT'}
              auditData={auditData}
              onSimulateHap={handleSimulateHap}
              isSimulatingHap={isSimulatingHap}
              simulationData={simulationData}
            />
          </div>

        </div>

      </main>

      {/* 3. x402 Payment Modal */}
      <X402PaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={currentInvoice}
        onApprove={handleApprovePayment}
        isProcessing={isProcessingPayment}
      />

    </div>
  );
}

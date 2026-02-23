"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  ArrowLeft, 
  Info, 
  Trophy, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Scan, 
  History, 
  User, 
  Plus, 
  CreditCard,
  ChevronRight,
  HelpCircle,
  X
} from 'lucide-react';

// --- Mission Data ---
const UPI_MISSIONS = [
  {
    id: 1,
    name: 'The OLX Request Scam',
    objective: 'You are selling a sofa online. A buyer sends this "payment". Spot 3 red flags.',
    type: 'request',
    flags: [
      { id: 'request-not-pay', title: 'Request vs Pay', description: 'The button says "PAY". In a real incoming payment, you never need to enter your PIN or click PAY.', points: 250 },
      { id: 'fake-notif', title: 'Fake Status Bar', description: 'The "Payment Received" text is part of the image, not a system notification.', points: 150 },
      { id: 'urgency', title: 'Urgency Tactic', description: 'The message "PIN required to receive" is a classic lie used to trick users into authorizing a debit.', points: 200 }
    ]
  },
  {
    id: 2,
    name: 'The Cashback Trap',
    objective: 'You received a scratch card notification. Find 3 red flags.',
    type: 'cashback',
    flags: [
      { id: 'too-good', title: 'Too Good To Be True', description: 'Random ₹999 cashbacks for no reason are almost always lures to phishing sites.', points: 100 },
      { id: 'unverified-sender', title: 'Unverified ID', description: 'The sender "Rewards_Unit_88" is not an official verified merchant.', points: 200 },
      { id: 'pin-for-reward', title: 'PIN for Rewards', description: 'You NEVER need to enter a UPI PIN to receive a reward or cashback.', points: 300 }
    ]
  }
];

export default function Level3() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [foundFlags, setFoundFlags] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentLevel = UPI_MISSIONS[currentLevelIdx];

  const handleFlagClick = (flagId:string) => {
    if (foundFlags.includes(flagId)) return;
    if (!currentLevel) return;
    const flag = currentLevel.flags.find(f => f.id === flagId);
    if (!flag) return;

    setFoundFlags(prev => [...prev, flagId]);
    setXp(prev => prev + flag.points);

    if (foundFlags.length + 1 === currentLevel.flags.length) {
      setTimeout(() => setShowSummary(true), 1200);
    }
  };

  const nextMission = () => {
    if (currentLevelIdx < UPI_MISSIONS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setFoundFlags([]);
      setShowSummary(false);
    } else {
      setCurrentLevelIdx(0);
      setFoundFlags([]);
      setXp(0);
      setShowSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-purple-200">
      {/* Mobile Frame */}
      <div className="w-full max-w-[400px] h-[800px] bg-white shadow-2xl overflow-hidden relative border-[8px] border-slate-900 rounded-[3rem] flex flex-col">
        
        {/* Phone Notch/Header */}
        <div className="bg-white pt-10 pb-2 px-6 flex justify-between items-center border-b border-slate-100">
          <div className="text-purple-700 font-black text-xl flex items-center gap-1">
            <Smartphone size={20} />
            <span>SecurePay</span>
          </div>
          <div className="flex gap-3 text-slate-400">
            <History size={20} />
            <HelpCircle size={20} />
            <User size={20} className="text-purple-600 bg-purple-50 rounded-full" />
          </div>
        </div>

        {/* Game Stats Overlay */}
        <div className="bg-purple-700 text-white px-6 py-3 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Level {currentLevel?.id}</span>
            <span className="text-sm font-bold truncate w-32">{currentLevel?.name}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Score</span>
            <span className="text-lg font-black">{xp} XP</span>
          </div>
        </div>

        {/* Main Interface Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
          
          {/* Mission Objective Toast */}
          <div className="bg-blue-600 text-white p-3 rounded-xl text-xs flex gap-2 items-start shadow-md mb-4">
            <Info size={16} className="shrink-0" />
            <p>{currentLevel?.objective}</p>
          </div>

          {/* SIMULATED APP UI: MISSION 1 */}
          {currentLevel?.id === 1 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">AK</div>
                  <div>
                    <h3 className="font-bold text-sm">Anil Kumar (Buyer)</h3>
                    <p className="text-[10px] text-slate-400 font-mono">anil.buyer@okpay</p>
                  </div>
                  <div className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${foundFlags.includes('fake-notif') ? 'bg-red-500 text-white animate-pulse' : 'bg-green-100 text-green-700'}`} onClick={() => handleFlagClick('fake-notif')}>
                    ✔ PAYMENT RECEIVED
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium italic">Requesting for Sofa Sale</span>
                    <span className="text-xl font-black text-slate-800">₹12,000</span>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${foundFlags.includes('urgency') ? 'bg-red-100 border-red-400 text-red-700' : 'bg-white border-transparent'}`}
                    onClick={() => handleFlagClick('urgency')}
                  >
                    <p className="text-[11px] font-bold leading-tight text-black">
                      Note: &quot;Please click PAY and enter UPI PIN to receive money in your bank account immediately.&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button className="bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm opacity-80">DECLINE</button>
                    <button 
                      className={`py-3 rounded-xl font-black text-sm transition-all shadow-lg ${foundFlags.includes('request-not-pay') ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-purple-600 text-white'}`}
                      onClick={() => handleFlagClick('request-not-pay')}
                    >
                      PAY ₹12,000
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATED APP UI: MISSION 2 */}
          {currentLevel?.id === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">New Reward Unlocked!</span>
                  <X size={16} className="text-slate-300" />
                </div>
                
                <div className="p-8 flex flex-col items-center gap-6">
                  <div 
                    className={`w-48 h-48 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex flex-col items-center justify-center shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95 ${foundFlags.includes('too-good') ? 'ring-4 ring-red-400 animate-bounce shadow-red-200' : ''}`}
                    onClick={() => handleFlagClick('too-good')}
                  >
                    <Trophy size={64} className="text-white mb-2" />
                    <span className="text-white font-black text-2xl">₹999</span>
                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Cashback</span>
                  </div>

                  <div 
                    className={`text-center p-3 rounded-xl cursor-pointer ${foundFlags.includes('pin-for-reward') ? 'bg-red-50' : ''}`}
                    onClick={() => handleFlagClick('pin-for-reward')}
                  >
                    <p className="text-xs text-slate-500 mb-4 font-medium italic leading-snug px-4">&quot;Click below to claim. Redirecting to Secure PIN page...&quot;</p>
                    <button className="w-full bg-purple-600 text-white py-3 px-8 rounded-full font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      CLAIM NOW <Zap size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>

                <div 
                   className={`p-3 bg-slate-50 text-center border-t border-slate-100 cursor-pointer transition-colors ${foundFlags.includes('unverified-sender') ? 'bg-red-100' : 'hover:bg-slate-100'}`}
                   onClick={() => handleFlagClick('unverified-sender')}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Sent by: </span>
                  <span className={`text-[10px] font-bold ${foundFlags.includes('unverified-sender') ? 'text-red-600' : 'text-slate-600'}`}>Rewards_Unit_88 (Unverified)</span>
                </div>
              </div>
            </div>
          )}

          {/* Fake Bottom Navigation */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            <div className="bg-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-sm opacity-40">
              <Plus size={18} className="text-purple-600" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">Transfer</span>
            </div>
            <div className="bg-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-sm opacity-40">
              <Scan size={18} className="text-purple-600" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">QR Scan</span>
            </div>
            <div className="bg-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-sm opacity-40">
              <CreditCard size={18} className="text-purple-600" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">Banks</span>
            </div>
            <div className="bg-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-sm opacity-40">
              <User size={18} className="text-purple-600" />
              <span className="text-[8px] font-bold text-slate-500 uppercase">Profile</span>
            </div>
          </div>
        </div>

        {/* Threat Intelligence Drawer */}
        <div className="bg-white border-t border-slate-200 p-4 max-h-[180px] overflow-y-auto">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex justify-between">
            <span>Threat Intelligence</span>
            <span className="text-purple-600">{foundFlags.length} / {currentLevel?.flags.length}</span>
          </h2>
          <div className="space-y-2">
            {currentLevel?.flags.map(flag => (
              <div key={flag.id} className="flex gap-3 items-center">
                <div className={`shrink-0 transition-colors ${foundFlags.includes(flag.id) ? 'text-green-500' : 'text-slate-200'}`}>
                  {foundFlags.includes(flag.id) ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded border-2 border-slate-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold truncate ${foundFlags.includes(flag.id) ? 'text-slate-800' : 'text-slate-300'}`}>
                    {foundFlags.includes(flag.id) ? flag.title : 'Scan Suspicious Elements...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Overlay */}
        {showSummary && (
          <div className="absolute inset-0 z-50 bg-purple-900/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Trophy size={40} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Mission Passed</h2>
            <p className="text-purple-200 text-xs mb-8 leading-relaxed">
              You correctly identified the UPI fraud triggers. Remember: <br/>
              <span className="text-white font-bold underline">PIN IS ONLY FOR SENDING MONEY, NEVER RECEIVING.</span>
            </p>
            <div className="w-full bg-white/10 rounded-2xl p-4 mb-8 border border-white/20 text-white font-mono">
              <p className="text-[10px] opacity-60 uppercase mb-1">SCORE UPDATED</p>
              <p className="text-3xl font-black">+{currentLevel?.flags.reduce((acc, curr) => acc + curr.points, 0)} XP</p>
            </div>
            <button 
              onClick={nextMission}
              className="w-full bg-white text-purple-900 font-black py-4 rounded-xl shadow-xl hover:bg-purple-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs active:scale-95 transition-transform"
            >
              {currentLevelIdx < UPI_MISSIONS.length - 1 ? 'Start Next Security Drill' : 'Restart Training'} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Floating Tooltip for Analysis */}
        {foundFlags.length > 0 && !showSummary && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white p-3 rounded-xl shadow-2xl text-[10px] animate-in slide-in-from-bottom border border-slate-700 font-mono z-40">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-1 uppercase tracking-tighter">
              <AlertTriangle size={14} /> Intelligence Analysis:
            </div>
            {currentLevel?.flags.find(f => f.id === foundFlags[foundFlags.length - 1])?.description}
          </div>
        )}
      </div>
    </div>
  );
}
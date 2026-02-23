"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Terminal, 
  Trophy, 
  Zap, 
  Mail, 
  ExternalLink, 
  Paperclip, 
  Clock,
  Search,
  Trash2,
  Archive,
  Flag
} from 'lucide-react';

// --- Mission Content ---
const EMAIL_MISSION = {
  name: 'The Phishing Filter',
  objective: 'Analyze this corporate email. Find 5 red flags that indicate it is a phishing attempt.',
  flags: [
    { id: 'sender-spoof', title: 'Display Name Spoofing', description: 'The name says "IT Helpdesk" but the actual email address is "it-support@company-update.net". Legitimate company emails would come from @company.com.', points: 200 },
    { id: 'bad-grammar', title: 'Grammar & Tone', description: 'Professional corporate emails rarely use "!!!" or redundant words like "workstation workstation". Phishers often use urgency to bypass critical thinking.', points: 100 },
    { id: 'hidden-url', title: 'URL Mismatch', description: 'Hovering over the button reveals "http://bit.ly/steal-creds". Never trust a button label; always check the link target.', points: 250 },
    { id: 'malicious-attachment', title: 'Risky Attachment', description: 'An .html attachment is a red flag. These are often used to host fake login pages that run locally on your browser to steal credentials.', points: 200 },
    { id: 'generic-signoff', title: 'Generic Sign-off', description: 'Real IT departments provide specific contact extensions or personal names. Vague signatures like "Global Security Team" are common in mass-phishing.', points: 150 }
  ]
};

export default function Level2() {
  const [foundFlags, setFoundFlags] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [message, setMessage] = useState({ text: EMAIL_MISSION.objective, type: "info" });
  const [showSummary, setShowSummary] = useState(false);

  const handleFlagClick = (flagId:string) => {
    if (foundFlags.includes(flagId)) return;
    const flag = EMAIL_MISSION.flags.find(f => f.id === flagId);
    if (!flag) return;

    setFoundFlags(prev => [...prev, flagId]);
    if(flag){
    setXp(prev => prev + flag.points);

    setMessage({ text: `Flag Identified: ${flag.title}! +${flag.points} XP`, type: "success" });
    }
    if (foundFlags.length + 1 === EMAIL_MISSION.flags.length) {
      setTimeout(() => setShowSummary(true), 1200);
    }
  };

  const resetGame = () => {
    setFoundFlags([]);
    setXp(0);
    setShowSummary(false);
    setMessage({ text: EMAIL_MISSION.objective, type: "info" });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-4 md:p-8">
      {/* Header Info */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Shield className="text-slate-900" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Email <span className="text-emerald-400">Forensics</span></h1>
            <p className="text-xs text-slate-400 font-mono">LAB-SESSION: {EMAIL_MISSION.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-800/50 border border-slate-700 p-4 rounded-2xl backdrop-blur-md">
           <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Score</p>
              <p className="text-2xl font-black text-emerald-400 leading-none">{xp}</p>
           </div>
           <div className="h-8 w-[1px] bg-slate-700" />
           <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Detected</p>
              <p className="text-2xl font-black text-white leading-none">{foundFlags.length}/{EMAIL_MISSION.flags.length}</p>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Interface */}
        <div className="lg:col-span-2">
          <div className="bg-[#f8fafc] rounded-2xl shadow-2xl overflow-hidden border border-slate-300 text-slate-800">
            {/* Outlook-style Ribbon */}
            <div className="bg-[#f1f5f9] border-b border-slate-200 p-3 flex gap-4 overflow-x-auto">
              <div className="flex flex-col items-center gap-1 opacity-50"><Trash2 size={16} /><span className="text-[10px]">Delete</span></div>
              <div className="flex flex-col items-center gap-1 opacity-50"><Archive size={16} /><span className="text-[10px]">Archive</span></div>
              <div className="flex flex-col items-center gap-1 opacity-50 text-red-600"><Flag size={16} /><span className="text-[10px]">Junk</span></div>
              <div className="h-8 w-[1px] bg-slate-300 mx-2" />
              <div className="bg-white border border-slate-300 rounded px-2 py-1 flex items-center gap-2 flex-1 max-w-xs">
                <Search size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-400">Search mail...</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Sender Info */}
              <div 
                className={`group relative p-4 rounded-xl border-2 transition-all cursor-crosshair
                  ${foundFlags.includes('sender-spoof') ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                onClick={() => handleFlagClick('sender-spoof')}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">IT</div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">System Security Update Required!</h3>
                      <p className="text-sm text-slate-600">
                        From: <span className="font-bold text-slate-900">IT Helpdesk</span> 
                        <span className="ml-2 text-slate-400 italic">&lt;it-support@company-update.net&gt;</span>
                      </p>
                      <p className="text-xs text-slate-500">To: <span className="underline">employee_09@company.com</span></p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> Today, 11:04 AM
                  </div>
                </div>
                {foundFlags.includes('sender-spoof') && (
                  <div className="absolute top-2 right-2 text-red-500 animate-pulse"><AlertTriangle size={18} /></div>
                )}
              </div>

              {/* Body Content */}
              <div 
                className={`leading-relaxed text-slate-700 space-y-4 cursor-crosshair p-2 rounded transition-colors
                  ${foundFlags.includes('bad-grammar') ? 'bg-red-50 ring-1 ring-red-200' : 'hover:bg-slate-50/50'}`}
                onClick={() => handleFlagClick('bad-grammar')}
              >
                <p className="font-bold text-lg">Dear Valued User !!!</p>
                <p className='text-sm'>
                  Our central servers have detected a major security vulnerability vulnerability on your 
                  workstation workstation! If you do not react immediately, your access to all company 
                  resource will be revoked by the end of today!!!
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center py-6">
                <div className="relative group">
                  <button 
                    className="bg-[#2563eb] text-white px-10 py-4 rounded-lg font-bold shadow-xl hover:bg-blue-700 transition-all cursor-crosshair"
                    onClick={() => handleFlagClick('hidden-url')}
                  >
                    Click to Verify Account Credentials
                  </button>
                  {/* Tooltip Simulation */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-slate-800 text-white text-[11px] px-3 py-1.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none whitespace-nowrap z-10 border border-slate-600">
                    Target: http://bit.ly/steal-creds-portal/login.php
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-tighter">Do not share this link with others.</p>
              </div>

              {/* Attachments & Signoff */}
              <div className="pt-8 border-t border-slate-100">
                <div 
                  className={`max-w-xs flex items-center gap-3 p-4 border-2 rounded-xl mb-6 transition-all cursor-crosshair
                    ${foundFlags.includes('malicious-attachment') ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200 border-dashed hover:border-slate-300'}`}
                  onClick={() => handleFlagClick('malicious-attachment')}
                >
                  <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
                    <Paperclip size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Security_Invoice_Final.html</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">14.2 KB - HTML Doc</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-400" />
                </div>

                <div 
                  className={`text-sm text-slate-500 italic p-2 rounded cursor-crosshair
                    ${foundFlags.includes('generic-signoff') ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-slate-50/50'}`}
                  onClick={() => handleFlagClick('generic-signoff')}
                >
                  Thanks,<br />
                  Global IT Security Administration & Compliance Team<br />
                  <span className="text-xs opacity-60">Automated system message - do not reply.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h2 className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
              <Terminal size={16} /> Analysis Checklist
            </h2>
            <div className="space-y-4">
              {EMAIL_MISSION.flags.map(flag => (
                <div key={flag.id} className="flex gap-4">
                  <div className={`mt-1 shrink-0 ${foundFlags.includes(flag.id) ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {foundFlags.includes(flag.id) ? <CheckCircle size={20} /> : <div className="w-5 h-5 border-2 border-slate-700 rounded-md" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${foundFlags.includes(flag.id) ? 'text-white' : 'text-slate-500 italic'}`}>
                      {foundFlags.includes(flag.id) ? flag.title : "??? [Scan Pending]"}
                    </p>
                    {foundFlags.includes(flag.id) && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{flag.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-blue-500/10 border-blue-500/50 text-blue-300'
          }`}>
            <div className="flex gap-3">
              <Info size={20} className="shrink-0" />
              <p className="text-xs font-mono leading-relaxed">{message.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-slate-800 border-2 border-emerald-500 rounded-[2.5rem] max-w-lg w-full p-12 text-center shadow-[0_0_100px_rgba(16,185,129,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            
            <div className="bg-emerald-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Trophy size={48} className="text-slate-900" />
            </div>
            
            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Threat Mitigated</h2>
            <p className="text-slate-400 mb-10 text-lg leading-snug px-4">
              You successfully identified all critical red flags in this phishing attempt. Your forensic analysis prevented a major credential breach.
            </p>
            
            <div className="bg-slate-700/50 p-6 rounded-3xl mb-10 border border-slate-600">
              <p className="text-xs uppercase text-slate-400 font-bold mb-2 tracking-widest">Efficiency Bonus</p>
              <p className="text-4xl font-black text-emerald-400">+{xp} <span className="text-xl opacity-50 text-white">XP</span></p>
            </div>

            <button 
              onClick={resetGame} 
              className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl hover:bg-emerald-400 hover:text-slate-900 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl group"
            >
              Reset Forensics Lab <Zap size={20} className="group-hover:animate-pulse" />
            </button>
          </div>
        </div>
      )}
      
      {/* Footer Instruction */}
      <footer className="max-w-4xl mx-auto mt-12 text-center text-slate-500">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Interactive Security Training Module — Restricted Access</p>
      </footer>
    </div>
  );
}
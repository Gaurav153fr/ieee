"use client";
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Lock, User, Terminal, Trophy, Zap } from 'lucide-react';

// --- Game Constants & Content ---
const RED_FLAGS = [
  {
    id: 'http-insecure',
    title: 'Insecure Protocol',
    description: 'The site is using HTTP instead of HTTPS. Data sent over this connection is unencrypted and can be intercepted.',
    points: 150,
    elementId: 'url-bar'
  },
  {
    id: 'typosquatting',
    title: 'Typosquatting',
    description: 'The domain is "trust-worthy-bank.co" instead of ".com". Attackers use similar-looking domains to trick users.',
    points: 200,
    elementId: 'url-domain'
  },
  {
    id: 'urgency-trap',
    title: 'Artificial Urgency',
    description: '"Account DELETED in 1 hour" is a classic social engineering tactic to make you panic and bypass critical thinking.',
    points: 100,
    elementId: 'banner'
  },
  {
    id: 'exposed-password',
    title: 'Exposed Sensitive Data',
    description: 'The password field is showing plain text. This is a massive security risk for anyone glancing at your screen.',
    points: 150,
    elementId: 'password-field'
  },
  {
    id: 'suspicious-download',
    title: 'Malicious Executable',
    description: 'Banks never ask you to download .exe files directly from a landing page. This is likely malware.',
    points: 250,
    elementId: 'download-link'
  },
  {
    id: 'unofficial-email',
    title: 'Non-Corporate Email',
    description: 'Support uses a @gmail.com address. A real bank would always use their official domain for communications.',
    points: 100,
    elementId: 'footer-email'
  }
];

export default function Level1() {
  const [foundFlags, setFoundFlags] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState({ text: "Mission: Identify all 6 security red flags on this page.", type: "info" });
  const [showSummary, setShowSummary] = useState(false);

  // Logic to handle flag discovery
  const handleFlagClick = (flagId:string) => {
    if (foundFlags.includes(flagId)) return;

    const flag = RED_FLAGS.find(f => f.id === flagId);
    setFoundFlags(prev => [...prev, flagId]);
    if (flag){
    setXp(prev => prev + flag.points);
    setMessage({ text: `Target Acquired: ${flag.title}! +${flag.points} XP`, type: "success" });
    }
    if (foundFlags.length + 1 === RED_FLAGS.length) {
      setTimeout(() => setShowSummary(true), 1500);
    }
  };

  // Leveling logic
  useEffect(() => {
    const nextLevelXp = level * 500;
    if (xp >= nextLevelXp) {
      setLevel(prev => prev + 1);
      setMessage({ text: `LEVEL UP! You are now Level ${level + 1}`, type: "level" });
    }
  }, [xp, level]);

  const resetGame = () => {
    setFoundFlags([]);
    setXp(0);
    setLevel(1);
    setShowSummary(false);
    setMessage({ text: "Mission Reset. Find all 6 red flags.", type: "info" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* --- RPG HUD --- */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Shield className="text-slate-900" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">SEC-OPS <span className="text-emerald-400">COMMAND</span></h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Agent: Guest_User_01</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono text-slate-400 uppercase">Hacker Level</span>
              <span className="text-2xl font-black text-emerald-400 italic">LVL {level}</span>
            </div>
            <div className="w-48">
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span>XP: {xp}</span>
                <span>NEXT: {level * 500}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" 
                  style={{ width: `${(xp / (level * 500)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* --- Sidebar Objectives --- */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h2 className="flex items-center gap-2 font-bold mb-4 text-slate-300">
              <Terminal size={18} className="text-emerald-400" />
              OBJECTIVES
            </h2>
            <ul className="space-y-3">
              {RED_FLAGS.map(flag => (
                <li key={flag.id} className="flex items-start gap-3 text-sm">
                  {foundFlags.includes(flag.id) ? (
                    <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-[18px] h-[18px] border-2 border-slate-600 rounded shrink-0 mt-0.5" />
                  )}
                  <span className={foundFlags.includes(flag.id) ? "text-slate-500 line-through" : "text-slate-300"}>
                    {foundFlags.includes(flag.id) ? flag.title : "Unknown Threat"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' :
            message.type === 'level' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300 animate-bounce' :
            'bg-blue-500/10 border-blue-500/50 text-blue-300'
          }`}>
            <div className="flex gap-2">
              <Info size={18} className="shrink-0" />
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </aside>

        {/* --- The Vulnerable Site (Canvas) --- */}
        <section className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-800 border-4 border-slate-700">
            
            {/* Browser Top Bar */}
            <div className="bg-slate-200 p-3 flex items-center gap-3 border-b border-slate-300">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div 
                className={`flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border-2 transition-all cursor-help
                  ${foundFlags.includes('http-insecure') || foundFlags.includes('typosquatting') ? 'border-red-400' : 'border-slate-300'}
                `}
                onClick={() => {
                  handleFlagClick('http-insecure');
                  handleFlagClick('typosquatting');
                }}
              >
                <span className="text-red-500 font-bold flex items-center gap-1">http://</span>
                <span className="text-slate-600">trust-worthy-bank</span>
                <span className="text-slate-400">.co/login</span>
                <AlertTriangle size={14} className="ml-auto text-yellow-600" />
              </div>
            </div>

            {/* Urgency Banner */}
            <div 
              className={`p-2 text-center text-sm font-bold animate-pulse cursor-help transition-colors
                ${foundFlags.includes('urgency-trap') ? 'bg-red-200 text-red-800' : 'bg-red-600 text-white'}
              `}
              onClick={() => handleFlagClick('urgency-trap')}
            >
              ⚠ ACTION REQUIRED: Your account will be DELETED in 1 hour. Click here to verify!
            </div>

            {/* Site Content */}
            <div className="p-12 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-800 p-2 rounded text-white">
                  <Shield size={32} />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">TrustWorthy <span className="text-slate-500">Bank</span></h2>
              </div>

              <div className="w-full max-w-sm bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-center font-bold text-slate-600 uppercase tracking-widest text-sm">Secure Member Portal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Username</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly 
                        value="admin_user_99" 
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" // INTENTIONALLY TEXT
                        readOnly 
                        value="P@$$w0rd123!" 
                        className={`w-full bg-white border rounded-lg py-2.5 pl-10 pr-4 text-sm cursor-help transition-all
                          ${foundFlags.includes('exposed-password') ? 'border-red-400 bg-red-50' : 'border-slate-200'}
                        `}
                        onClick={() => handleFlagClick('exposed-password')}
                      />
                      <div className="absolute right-3 top-3 text-[10px] text-red-500 font-bold uppercase">Exposed!</div>
                    </div>
                  </div>

                  <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors shadow-lg">
                    Login to Dashboard
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <button 
                    className={`text-xs font-bold underline transition-all
                      ${foundFlags.includes('suspicious-download') ? 'text-red-500 scale-110' : 'text-slate-400'}
                    `}
                    onClick={() => handleFlagClick('suspicious-download')}
                  >
                    Download our Security Tool (security_installer.exe)
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-100 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 font-medium">
              <div>© 2018-2022 TrustWorthy Banking Corp. All Rights Reserved.</div>
              <div 
                className={`cursor-help p-1 rounded transition-all ${foundFlags.includes('unofficial-email') ? 'bg-red-100 text-red-700 font-bold' : ''}`}
                onClick={() => handleFlagClick('unofficial-email')}
              >
                Contact Support: admin-support-trustbank@gmail.com
              </div>
            </footer>
          </div>
        </section>
      </main>

      {/* --- Completion Modal --- */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-slate-800 border-2 border-emerald-500 rounded-2xl max-w-lg w-full p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-emerald-500 rounded-full p-4">
                <Trophy size={48} className="text-slate-900" />
              </div>
              <h2 className="text-3xl font-black text-white italic">MISSION COMPLETE</h2>
              <p className="text-slate-400">You identified all vulnerabilities and prevented a potential breach. Your threat detection skills are sharp, Agent.</p>
              
              <div className="grid grid-cols-2 gap-4 w-full py-4">
                <div className="bg-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 uppercase">XP Earned</div>
                  <div className="text-2xl font-bold text-emerald-400">+{xp}</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 uppercase">New Rank</div>
                  <div className="text-2xl font-bold text-emerald-400">LVL {level}</div>
                </div>
              </div>

              <button 
                onClick={resetGame}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Restart Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Simple Tooltip/Toast --- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
         {foundFlags.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono max-w-[200px]">
              <span className="text-emerald-400">System Logs:</span><br/>
              {foundFlags.slice(-1).map(id => (
                <span key={id}>{ RED_FLAGS.find(f => f.id === id)?.description}</span>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
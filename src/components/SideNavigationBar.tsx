"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, Sparkles, ShoppingBag, ShieldCheck, 
  Home, ChevronLeft, ChevronRight, 
  ChartColumnBig,
  Users
} from 'lucide-react';



const SideNavigationBar = ({user_id}:{user_id:string|undefined}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  if(!user_id) return null
  const NAV_ITEMS = [
    { label: 'Learn', href: '/dashboard', icon: Home, color: 'text-emerald-500' },
    { label: 'AI Lessons', href: '/ai-lesson', icon: Sparkles, color: 'text-blue-400' },
    { label: 'Fact Checker', href: '/fact-checker', icon: ShieldCheck, color: 'text-orange-400' },
    { label: 'Shop', href: '/shop', icon: ShoppingBag, color: 'text-rose-400' },
    { label: 'Profile', href: `/profile/${user_id}`, icon: User, color: 'text-zinc-400' },
    { label: 'Leaderboard', href: '/leaderboard', icon: ChartColumnBig, color: 'text-yellow-400' },
    { label: 'Community', href: '/community', icon: Users, color: 'text-cyan-400' },
  ];
  return (
    <nav className={`
      fixed left-0 top-0 h-screen z-50 bg-[#09090b] border-r-4 border-zinc-800 
      flex flex-col p-4 transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Toggle Button - Chunky Style */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 w-8 h-8 bg-zinc-800 border-2 border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-lg z-50"
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Brand Logo / Icon */}
      <div className={`px-2 py-8 transition-all duration-300 ${isCollapsed ? 'text-center' : 'px-4'}`}>
        <Link href="/" className="font-black tracking-tighter text-emerald-500">
          {isCollapsed ? (
            <span className="text-2xl">CC</span>
          ) : (
            <span className="text-3xl">CyberClash</span>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-grow  gap-1 flex flex-col ">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""}>
              <div className={`
                flex items-center gap-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-100
                ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                ${isActive 
                  ? `bg-blue-500/10 border-2 border-blue-500 ${item.color}` 
                  : 'hover:bg-zinc-800 border-2 border-transparent text-zinc-500'}
              `}>
                <Icon size={28} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Progress - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-4 bg-zinc-900/50 rounded-3xl border-2 border-zinc-800 animate-in fade-in duration-500">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 text-center">
            Next Goal
          </p>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-2/3 shadow-[0_0_10px_#10b981]" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default SideNavigationBar;
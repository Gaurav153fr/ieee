"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  Sword, 
  ChevronRight, 
  Globe, 
  Lock 
} from 'lucide-react';
import Link from 'next/link';
import TactileButton from '@/app/_components/TactileButton';

// Reuse your PixelKnight or a simplified version for the Hero
const FloatingKnight = () => (
  <motion.div
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="relative"
  >
    <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full" />
    <div className="relative scale-150 md:scale-[2.5]">
        {/* Placeholder for your PixelKnight component */}
        <ShieldCheck size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
    </div>
  </motion.div>
);

export default function AlternateLanding() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      {/* --- Nav --- */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <ShieldCheck className="text-black" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">CyberClash</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-zinc-500">
          <a href="#features" className="hover:text-emerald-400 transition">Features</a>
          <a href="#community" className="hover:text-emerald-400 transition">Community</a>
          <a href="#leaderboard" className="hover:text-emerald-400 transition">Leaderboard</a>
        </div>
        <Link href="/login">
          <TactileButton variant="secondary" className="px-6 py-2">Login</TactileButton>
        </Link>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-center md:text-left"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              MASTER <br />
              <span className="text-emerald-400">DEFENSE</span> <br />
              THROUGH PLAY.
            </h1>
            <p className="text-zinc-400 text-xl max-w-md mx-auto md:mx-0 font-medium">
              The world's first AI-powered cybersecurity battleground. Learn to spot scams, hack-proof your life, and climb the leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/lesson/1">
                <TactileButton variant="primary" className="px-10 py-5 text-xl w-full sm:w-auto">
                  Get Started
                </TactileButton>
              </Link>
              <TactileButton variant="secondary" className="px-10 py-5 text-xl w-full sm:w-auto">
                View Missions
              </TactileButton>
            </div>
          </motion.div>

          <div className="flex justify-center items-center">
            <FloatingKnight />
          </div>
        </div>
      </section>

      {/* --- Feature Grid (Duolingo Style Cards) --- */}
      <section id="features" className="py-24 bg-zinc-950/50 border-y border-zinc-900 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            <FeatureCard 
              icon={<Zap className="text-amber-400" />}
              title="AI-Generated Levels"
              description="Fresh threats daily. Our AI analyzes real-world breaches to create new missions instantly."
            />
            <FeatureCard 
              icon={<Users className="text-blue-400" />}
              title="Community Intel"
              description="Post scams you've encountered. Your real-life experience helps train the entire community."
            />
            <FeatureCard 
              icon={<Sword className="text-rose-400" />}
              title="Mega-Simulations"
              description="Every level ends with a 'Live Attack.' Spot the fake site or lose your streak."
            />

          </div>
        </div>
      </section>

      {/* --- "Fact Check AI" Section --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-emerald-500 rounded-[2rem] p-12 grid md:grid-cols-2 gap-12 items-center text-black">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
              Suspect a Scam? <br /> Ask our Oracle.
            </h2>
            <p className="text-emerald-950 text-lg font-bold mb-8 opacity-80">
              Our specialized Fact-Check AI analyzes links, emails, and texts in seconds. 
              Never get phished again.
            </p>
            <TactileButton variant="secondary" className="bg-white border-zinc-200 text-black hover:bg-zinc-100">
              Try the AI Oracle
            </TactileButton>
          </div>
          <div className="bg-emerald-400/50 rounded-2xl p-6 border-2 border-emerald-600/20 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="bg-white/90 p-3 rounded-xl text-sm font-bold shadow-sm">"Is this Netflix link safe?"</div>
              <div className="bg-zinc-900 text-white p-4 rounded-xl text-sm font-medium border-b-4 border-zinc-950">
                <span className="text-rose-400 font-bold">WARNING:</span> This URL uses a look-alike domain (nelfix.com). Do not enter credentials.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 font-bold uppercase tracking-tighter">© 2026 CyberQuest AI Labs</p>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[2rem] space-y-4 hover:border-emerald-500/50 transition-colors"
    >
      <div className="bg-zinc-950 w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-800 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-zinc-400 font-medium leading-relaxed">{description}</p>
    </motion.div>
  );
}
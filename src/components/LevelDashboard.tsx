"use client";
import React from "react";
import Link from "next/link";
import { Check, Star, Lock } from "lucide-react";

const LEVELS = [
  { id: 1, title: "HTTP Basics", status: "completed", topic: "Web Security" },
  { id: 2, title: "Hashing", status: "current", topic: "Web Security" },
  { id: 3, title: "Phishing", status: "locked", topic: "Web Security" },
  { id: 4, title: "XSS Attacks", status: "locked", topic: "Web Security" },
  { id: 5, title: "SQL Injection", status: "locked", topic: "Database" },
  { id: 6, title: "CORS", status: "locked", topic: "Database" },
  { id: 7, title: "Rpg", status: "current", topic: "Special" ,special: true},
  { id: 8, title: "Squid game", status: "current", topic: "Special" ,special: true},
{ id: 9, title: "Threat connector", status: "current", topic: "Special" ,special: true},
];

const LevelDashboard = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-20">
      <div className="max-w-md mx-auto pt-10 px-4">
        <div className="flex flex-col items-center relative">
          {LEVELS.map((level, index) => {
            // THE WAVY MATH: Offset buttons based on a sine wave
            // Adjust the multiplier (50) for wave width and (0.8) for frequency
            const xOffset = Math.sin(index * 0.8) * 60;
            
            return (
              <div 
                key={level.id} 
                className="mb-8 flex flex-col items-center"
                style={{ transform: `translateX(${xOffset}px)` }}
              >
                {/* Topic Header - only show if it changes or at the start */}
                {index % 3 === 0 && (
                  <div className="mb-6 py-2 px-6 bg-zinc-800 rounded-2xl border-b-4 border-zinc-900">
                    <span className="uppercase tracking-widest text-xs font-black text-zinc-400">
                      {level.topic}
                    </span>
                  </div>
                )}

                <Link href={`/${level.special?"level":"lesson"}/${level.id}`}>
                  <div className="relative group cursor-pointer">
                    {/* The 3D Base Shadow */}
                    <div className={`absolute inset-0 translate-y-2 rounded-full blur-sm opacity-30 ${
                      level.status === "locked" ? "bg-zinc-700" : "bg-emerald-700"
                    }`} />
                    
                    {/* The Main Circular Button */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center border-b-8 transition-all active:translate-y-1 active:border-b-0
                      ${level.status === "completed" ? "bg-emerald-500 border-emerald-700 text-white" : ""}
                      ${level.status === "current" ? "bg-emerald-400 border-emerald-600 text-white animate-pulse" : ""}
                      ${level.status === "locked" ? "bg-zinc-800 border-zinc-950 text-zinc-600" : ""}
                    `}>
                      {level.status === "completed" ? <Check size={32} strokeWidth={4} /> : 
                       level.status === "current" ? <Star size={32} fill="white" /> : 
                       <Lock size={32} />}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {level.title}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelDashboard;
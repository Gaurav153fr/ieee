"use client";
import React from 'react';
import useSound from 'use-sound';
import { 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  ArrowRight, 
  BookOpen, // New icon for concepts
  Lightbulb  // Alternative for concepts
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLesson } from '@/hooks/useLesson';
import TactileButton from '@/app/_components/TactileButton';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export const LessonView = ({ level, levelId, user_id }: { level: LevelData, levelId: number, user_id: string | null }) => {
  const { 
    step, progress, selectedOption, setSelectedOption, 
    isCorrect, handleCheck, handleNext, isFinished ,
  } = useLesson(level.steps);

console.log("Rendering LessonView with levelId:", levelId, "and user_id:", user_id,level);


const [playError] = useSound('/sounds/error.mp3', { volume: 0.4 });

  const utils = api.useUtils();
  
  const { mutate, isPending } = api.profile.updateStats.useMutation({
    onSuccess: () => {
      // You might want to replace alert with a toast later
      void utils.profile.getById.invalidate(); 
    },
    onError: (error) => {
      console.error("Failed to update:", error.message);
    },
    onSettled: () => {
      void utils.profile.getById.invalidate();
    },
  });

  React.useEffect(() => {
    if (isFinished && user_id) {
      mutate({
        userId: user_id,
        xp: 100,
        points: 20,
        badges: [`level-${levelId}-complete`]
      });
    }
  }, [isFinished, user_id, levelId, mutate]);


  React.useEffect(() => {
    if (isCorrect === true) {
      
    } else if (isCorrect === false) {
      playError();
    }
  }, [isCorrect, playError]);


  if (isFinished) { 
    if(level.megaLevel !== null && level.megaLevel !== undefined){
      return (
        <div className='flex h-screen items-center justify-center bg-[#09090b]'>
          <div className='p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4'>
            <h2 className='text-2xl font-bold text-white'>Challenge Unlocked!</h2>
            <Link href={`/level/${level.megaLevel}`}>
              <TactileButton variant="primary" className="px-8 py-3">
                Go to Mega Level {level.megaLevel}
              </TactileButton>
            </Link>
          </div>
        </div>
      )
    }
    return <CompletionState currentLevelId={levelId} />;
  }

  // Determine if we show the "Check" button or just "Continue"
  const isQuiz = step?.type === 'quiz';
  const isConcept = step?.type === 'concept' || step?.type === 'comparison';
  const showCheck = isQuiz && isCorrect === null;

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 max-w-2xl mx-auto w-full">
        <X className="text-zinc-500 cursor-pointer hover:text-white transition" onClick={() => window.history.back()} />
        <Progress value={progress} className="h-2 bg-zinc-800" />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full overflow-y-auto">
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Dynamic Icon Section */}
          <div className="flex justify-center">
            {isQuiz ? (
              <AlertCircle size={80} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
            ) : isConcept ? (
              <div className="relative">
                 <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                 <Lightbulb size={80} className="text-amber-400 relative" />
              </div>
            ) : step?.id === 1 ? (
              <ShieldAlert size={80} className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]" />
            ) : (
              <ShieldCheck size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight">{step?.title}</h1>
            <div className="text-lg text-zinc-400 leading-relaxed max-w-md mx-auto">
                {/* Support for potential newline formatting in descriptions */}
                {step?.description.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                ))}
            </div>
          </div>

          {/* Quiz View */}
          {isQuiz && (
            <div className="grid gap-3 mt-8 w-full">
              {step.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => isCorrect === null && setSelectedOption(option)}
                  className={`p-5 border-2 rounded-2xl text-lg font-bold transition-all duration-200 ${
                    selectedOption === option 
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-300'
                  } ${isCorrect !== null && 'cursor-default'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Concept/Comparison View (Optional extra styling) */}
          {isConcept && (
             <div className="mt-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl text-left italic text-zinc-500 border-l-amber-500 border-l-4">
                Tip: Understanding the logic behind the attack is your best defense.
             </div>
          )}
        </div>
      </main>

      {/* Feedback Tray */}
      <footer className={`p-8 border-t border-zinc-800 transition-colors duration-300 ${
        isCorrect === true ? 'bg-emerald-950/30' : 
        isCorrect === false ? 'bg-rose-950/30' : 'bg-[#09090b]'
      }`}>
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-h-[3rem]">
            {isCorrect !== null && (
              <>
                <div className={`p-2 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {isCorrect ? <CheckCircle2 className="text-white" /> : <X className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <h2 className={`text-2xl font-black ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite!'}
                  </h2>
                </div>
              </>
            )}
            {/* If it's a concept, we can show a small "Keep going" prompt */}
            {isCorrect === null && isConcept && (
               <div className="flex items-center gap-2 text-zinc-500 font-medium">
                  <BookOpen size={20} />
                  <span>Informational Step</span>
               </div>
            )}
          </div>
          
          <TactileButton
            variant={isCorrect === false ? 'danger' : 'primary'}
            disabled={isQuiz && !selectedOption}
            onClick={showCheck ? handleCheck : handleNext}
            className="w-full md:w-64 py-4 text-xl"
          >
            {showCheck ? 'Check' : 'Continue'}
          </TactileButton>
        </div>
      </footer>
    </div>
  );
};


const CompletionState = ({ currentLevelId }: { currentLevelId: number }) => {
  const router = useRouter();
  const nextLevelId = currentLevelId + 1;

  // Trigger confetti on mount
  React.useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Animated Trophy Background Glow */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-emerald-500/30 blur-[100px] rounded-full animate-pulse" />
        <div className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-full shadow-2xl">
          <Trophy size={100} className="text-emerald-400 animate-bounce" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-sm">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          LEVEL {currentLevelId} <br/> 
          <span className="text-emerald-400">SECURED</span>
        </h1>
        <p className="text-zinc-400 text-lg font-medium leading-tight">
          Your digital fortress grows stronger. You just earned <span className="text-white font-bold">100 XP</span> and the <span className="text-white font-bold">Guardian Badge</span>.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-xs gap-4 mt-12">
      <Link href={`/lesson/${nextLevelId+1}`} className="flex items-center gap-2">
        <TactileButton 
          variant="primary" 
        
          className="w-full flex items-center justify-center gap-3 py-6 text-xl"
        >
         
          Next Lesson <ArrowRight size={24} />
        </TactileButton>
        </Link>
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-zinc-500 hover:text-zinc-300 font-bold transition-all py-2 flex items-center justify-center gap-2"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Stats Summary Mini-Card */}
      <div className="mt-12 flex gap-8 border-t border-zinc-800 pt-8 w-full max-w-xs justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Points</p>
          <p className="text-2xl font-black text-white">+20</p>
        </div>
        <div className="h-10 w-[1px] bg-zinc-800" />
        <div className="text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Accuracy</p>
          <p className="text-2xl font-black text-white">100%</p>
        </div>
      </div>
    </div>
  );
};
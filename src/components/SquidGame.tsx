import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Transition, type TargetAndTransition } from 'framer-motion';
import { Skull, Trophy, RotateCcw, Play, type LucideIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

// ============================================================
// ✏️  QUESTIONS DATA — THE ONLY THING YOU NEED TO EDIT
//     Each object = one bridge step (one pair of tiles).
//     Fields:
//       question    — text shown in the banner above the tiles
//       left.label  — answer text on the LEFT tile
//       right.label — answer text on the RIGHT tile
//       correctSide — 'left' | 'right'  (which tile is safe)
// ============================================================
const QUESTIONS: Question[] = [
  {
    question: "What is the primary objective of cybersecurity?",
    left:  { label: "Protection" },
    right: { label: "Speed" },
    correctSide: "left",
  },
  {
    question: "Public Wi-Fi without protection is",
    left:  { label: "Safe" },
    right: { label: "Risky" },
    correctSide: "right",
  },
  {
    question: "Suspicious email asking for details is",
    left:  { label: "Phishing" },
    right: { label: "Genuine" },
    correctSide: "left",
  },
  {
    question: "Using the same password everywhere is",
    left:  { label: "Secure" },
    right: { label: "Unsafe" },
    correctSide: "right",
  },
  {
    question: "HTTPS means connection is",
    left:  { label: "Encrypted" },
    right: { label: "Public" },
    correctSide: "left",
  },
  {
    question: "Strong passwords should be",
    left:  { label: "Complex" },
    right: { label: "Simple" },
    correctSide: "left",
  },
  {
    question: "QR codes from unknown posters are",
    left:  { label: "Trusted" },
    right: { label: "Suspicious" },
    correctSide: "right",
  },
  {
    question: "SQL injection attacks exploit",
    left:  { label: "Database" },
    right: { label: "Firewall" },
    correctSide: "left",
  },
  {
    question: "Too many ads and pop-ups indicate",
    left:  { label: "Malware" },
    right: { label: "Security" },
    correctSide: "left",
  },
  {
    question: "A login system without rate limiting is vulnerable to",
    left:  { label: "BruteForce" },
    right: { label: "Spoofing" },
    correctSide: "left",
  },
];

// ============================================================
// TYPES
// ============================================================

type Side = 'left' | 'right';
type GameStatus = 'START' | 'PLAYING' | 'FALLING' | 'WON' | 'GAME_OVER';

interface TileOption {
  label: string;
}

interface Question {
  question: string;
  left: TileOption;
  right: TileOption;
  correctSide: Side;
}

interface AnimationKeyframes {
  y?: number | number[];
  scale?: number | number[];
  opacity?: number | number[];
  rotate?: number;
}

interface ScreenAnimation {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
}

interface GameConfig {
  settings: {
    revealDelay: number;
    fallAnimDuration: number;
    confetti: confetti.Options;
  };
  theme: {
    bg: string;
    text: string;
    gridLine: string;
    progressBar: string;
    tile: {
      base: string;
      safe: string;
      danger: string;
      selected: string;
    };
    questionBadge: string;
    stepBadge: string;
  };
  copy: {
    title: string;
    tagline: string;
    rules: (n: number) => string;
    startBtn: string;
    retryBtn: string;
    playAgainBtn: string;
    finishLabel: string;
    startLabel: string;
    eliminatedTitle: string;
    eliminatedSubtitle: (step: number, total: number) => string;
    winTitle: string;
    winSubtitle: string;
    stepLabel: (n: number, total: number) => string;
  };
  player: {
    bodyColor: string;
    bodyBorder: string;
    headColor: string;
    headBorder: string;
    armColor: string;
    armBorder: string;
    shadowColor: string;
    symbolClass: string;
  };
  animations: {
    tile: {
      hover: TargetAndTransition;
      tap: TargetAndTransition;
    };
    jump: {
      keyframes: AnimationKeyframes;
      transition: Transition;
    };
    fall: {
      keyframes: AnimationKeyframes;
      transition: Transition;
    };
    screenEnter: ScreenAnimation;
    overlayEnter: ScreenAnimation;
  };
  icons: {
    start: LucideIcon;
    retry: LucideIcon;
    skull: LucideIcon;
    trophy: LucideIcon;
  };
}

// ============================================================
// ⚙️  GAME CONFIG — UI, theme, copy, animations
//     Edit to change look & feel without touching game logic
// ============================================================
const GAME_CONFIG: GameConfig = {
  settings: {
    revealDelay: 500,
    fallAnimDuration: 1100,
    confetti: { particleCount: 150, spread: 70, origin: { y: 0.6 } },
  },

  theme: {
    bg: "bg-zinc-950",
    text: "text-zinc-100",
    gridLine: "bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
    progressBar: "bg-rose-600",
    tile: {
      base:     "bg-zinc-900/80 border-zinc-700 hover:border-zinc-400 hover:bg-zinc-800/90",
      safe:     "bg-emerald-500/20 border-emerald-400",
      danger:   "bg-rose-500/20 border-rose-400",
      selected: "border-amber-400 bg-amber-500/10",
    },
    questionBadge: "bg-zinc-900 border border-zinc-700 text-zinc-200",
    stepBadge:     "text-zinc-500 text-xs font-mono uppercase tracking-widest",
  },

  copy: {
    title:              "Glass Bridge",
    tagline:            "Answer correctly. Or fall.",
    rules:              (n) => `Cross ${n} panels. Each tile hides an answer — only one is correct. Choose wrong and the glass shatters beneath you.`,
    startBtn:           "BEGIN THE GAME",
    retryBtn:           "TRY AGAIN",
    playAgainBtn:       "PLAY AGAIN",
    finishLabel:        "Start",
    startLabel:         "Finish",
    eliminatedTitle:    "Eliminated",
    eliminatedSubtitle: (step, total) => `You fell at step ${step} of ${total}.`,
    winTitle:           "Survivor",
    winSubtitle:        "You answered every question correctly!",
    stepLabel:          (n, total) => `Step ${n} / ${total}`,
  },

  player: {
    bodyColor:   "bg-rose-600",
    bodyBorder:  "border-rose-400",
    headColor:   "bg-zinc-950",
    headBorder:  "border-rose-400",
    armColor:    "bg-rose-600",
    armBorder:   "border-rose-400",
    shadowColor: "shadow-rose-900/50",
    symbolClass: "border-white",
  },

  animations: {
    tile: {
      hover: { scale: 1.03, y: -4 },
      tap:   { scale: 0.97 },
    },
    jump: {
      keyframes:  { y: [0, -50, 0], scale: [1, 1.15, 1], opacity: 1 },
      transition: { duration: 0.45, times: [0, 0.5, 1], ease: "easeInOut" },
    },
    fall: {
      keyframes:  { y: 400, rotate: 540, scale: 0.3, opacity: 0 },
      transition: { duration: 1.1, ease: "easeIn" },
    },
    screenEnter:  { initial: { opacity: 0, y: 20 },     animate: { opacity: 1, y: 0 },    exit: { opacity: 0, scale: 0.9 } },
    overlayEnter: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  },

  icons: { start: Play, retry: RotateCcw, skull: Skull, trophy: Trophy },
};

// ============================================================
// COMPONENT PROP TYPES
// ============================================================

interface PlayerCharacterProps {
  isFalling?: boolean;
  cfg: GameConfig['player'];
}

interface ProgressBarProps {
  current: number;
  total: number;
  cfg: GameConfig;
}

interface QuestionBadgeProps {
  question: string;
  stepNum: number;
  total: number;
  cfg: GameConfig;
}

interface AnswerTileProps {
  side: Side;
  label: string;
  isCorrect: boolean;
  isRevealed: boolean;
  isCurrent: boolean;
  isFalling: boolean;
  isSelected: boolean;
  isPending: boolean;
  onClick: () => void;
  disabled: boolean;
  cfg: GameConfig;
}

interface StartScreenProps {
  onStart: () => void;
  totalSteps: number;
  cfg: GameConfig;
}

interface GameOverScreenProps {
  currentStep: number;
  totalSteps: number;
  onRetry: () => void;
  cfg: GameConfig;
}

interface WinScreenProps {
  onRetry: () => void;
  cfg: GameConfig;
}

interface GameBoardProps {
  bridge: Question[];
  currentStep: number;
  playerSide: Side | null;
  revealedSteps: number[];
  pendingStep: number | null;
  status: GameStatus;
  isJumping: boolean;
  onJump: (side: Side, stepIdx: number) => void;
  cfg: GameConfig;
}

// ============================================================
// COMPONENTS
// ============================================================

const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ isFalling, cfg }) => (
  <motion.div
    className="relative w-10 h-10 flex flex-col items-center justify-center"
    animate={isFalling ? { rotate: 360 } : {}}
    transition={isFalling ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
  >
    <div className={`absolute bottom-0 w-7 h-7 ${cfg.bodyColor} rounded-t-lg border-2 ${cfg.bodyBorder} shadow-lg ${cfg.shadowColor}`} />
    <div className={`absolute top-0 w-5 h-5 ${cfg.headColor} rounded-full border-2 ${cfg.headBorder} flex items-center justify-center`}>
      <div className={`w-2.5 h-2.5 border ${cfg.symbolClass} rotate-45`} />
    </div>
    <div className={`absolute -left-1 bottom-1.5 w-1.5 h-4 ${cfg.armColor} rounded-full border ${cfg.armBorder}`} />
    <div className={`absolute -right-1 bottom-1.5 w-1.5 h-4 ${cfg.armColor} rounded-full border ${cfg.armBorder}`} />
  </motion.div>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, cfg }) => (
  <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 overflow-hidden z-20">
    <motion.div
      className={`h-full ${cfg.theme.progressBar}`}
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.4 }}
    />
  </div>
);

const QuestionBadge: React.FC<QuestionBadgeProps> = ({ question, stepNum, total, cfg }) => (
  <motion.div
    key={stepNum}
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${cfg.theme.questionBadge} rounded-xl px-4 py-3 max-w-xs w-full text-center shadow-xl`}
  >
    <p className={cfg.theme.stepBadge}>{cfg.copy.stepLabel(stepNum, total)}</p>
    <p className="text-sm font-semibold mt-1 leading-snug">{question}</p>
  </motion.div>
);

const AnswerTile: React.FC<AnswerTileProps> = ({
  side, label,
  isCorrect, isRevealed,
  isCurrent, isFalling,
  isSelected, isPending,
  onClick, disabled,
  cfg,
}) => {
  let tileClass = cfg.theme.tile.base;
  if (isPending && isSelected) tileClass = cfg.theme.tile.selected;
  else if (isRevealed) tileClass = isCorrect ? cfg.theme.tile.safe : cfg.theme.tile.danger;

  const animateVal    = isCurrent ? (isFalling ? cfg.animations.fall.keyframes  : cfg.animations.jump.keyframes)  : {};
  const transitionVal = isCurrent ? (isFalling ? cfg.animations.fall.transition : cfg.animations.jump.transition) : {};

  return (
    <motion.button
      whileHover={!disabled ? cfg.animations.tile.hover : {}}
      whileTap={!disabled   ? cfg.animations.tile.tap   : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-36 h-28 rounded-xl border-2 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center gap-2 px-3 ${tileClass}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />

      {isRevealed && !isCorrect && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500 fill-current">
            <path d="M0 0 L50 50 L0 100 Z M100 0 L50 50 L100 100 Z M0 0 L50 50 L100 0 Z M0 100 L50 50 L100 100 Z" />
          </svg>
        </div>
      )}

      <span className={`relative z-10 text-sm font-bold text-center leading-tight transition-colors duration-300
        ${isRevealed ? (isCorrect ? 'text-emerald-300' : 'text-rose-300') : 'text-zinc-100'}`}>
        {label}
      </span>

      {isRevealed && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-lg ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {isCorrect ? '✓' : '✗'}
        </motion.span>
      )}

      <AnimatePresence>
        {isCurrent && (
          <motion.div
            layoutId="player"
            initial={false}
            animate={animateVal as TargetAndTransition}
            transition={transitionVal}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <PlayerCharacter isFalling={isFalling} cfg={cfg.player} />
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">{side} panel: {label}</span>
    </motion.button>
  );
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart, totalSteps, cfg }) => {
  const StartIcon = cfg.icons.start;
  return (
    <motion.div key="start" {...cfg.animations.screenEnter} className="z-10 text-center space-y-8 max-w-md">
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-rose-600 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">
          {cfg.copy.title}
        </h1>
        <p className="text-zinc-400 font-medium uppercase tracking-[0.2em] text-sm">{cfg.copy.tagline}</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">{cfg.copy.rules(totalSteps)}</p>
        <button
          onClick={onStart}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
        >
          <StartIcon size={20} className="fill-current" />
          {cfg.copy.startBtn}
        </button>
      </div>
    </motion.div>
  );
};

const GameOverScreen: React.FC<GameOverScreenProps> = ({ currentStep, totalSteps, onRetry, cfg }) => {
  const SkullIcon = cfg.icons.skull;
  const RetryIcon = cfg.icons.retry;
  return (
    <motion.div key="game-over" {...cfg.animations.overlayEnter} className="z-10 text-center space-y-6">
      <div className="w-24 h-24 bg-rose-950/50 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <SkullIcon size={48} className="text-rose-500" />
      </div>
      <h2 className="text-5xl font-black text-white uppercase italic">{cfg.copy.eliminatedTitle}</h2>
      <p className="text-zinc-400">{cfg.copy.eliminatedSubtitle(currentStep + 1, totalSteps)}</p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 mx-auto"
      >
        <RetryIcon size={18} /> {cfg.copy.retryBtn}
      </button>
    </motion.div>
  );
};

const WinScreen: React.FC<WinScreenProps> = ({ onRetry, cfg }) => {
  const TrophyIcon = cfg.icons.trophy;
  const RetryIcon  = cfg.icons.retry;
  return (
    <motion.div key="won" {...cfg.animations.overlayEnter} className="z-10 text-center space-y-6">
      <div className="w-24 h-24 bg-emerald-950/50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <TrophyIcon size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-5xl font-black text-white uppercase italic">{cfg.copy.winTitle}</h2>
      <p className="text-zinc-400">{cfg.copy.winSubtitle}</p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-500 transition-all flex items-center gap-2 mx-auto"
      >
        <RetryIcon size={18} /> {cfg.copy.playAgainBtn}
      </button>
    </motion.div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({
  bridge, currentStep, playerSide,
  revealedSteps, pendingStep,
  status, isJumping, onJump, cfg,
}) => {
  const totalSteps = bridge.length;
  const activeStep = bridge[currentStep + 1] ?? null;

  return (
    <div className="relative w-full max-w-2xl h-[85vh] flex flex-col items-center">
      <ProgressBar current={currentStep + 1} total={totalSteps} cfg={cfg} />

      {/* Question banner */}
      <div className="pt-6 pb-2 z-20 flex flex-col items-center w-full px-4 min-h-[88px]">
        {activeStep && status === 'PLAYING' && (
          <QuestionBadge
            question={activeStep.question}
            stepNum={currentStep + 2}
            total={totalSteps}
            cfg={cfg}
          />
        )}
      </div>

      {/* Scrollable bridge */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-4 flex flex-col items-center gap-5 perspective-1000">
        {/* Finish */}
        <div className="relative w-full h-28 bg-zinc-800/30 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-zinc-500 font-black uppercase tracking-widest text-lg">{cfg.copy.finishLabel}</span>
          {currentStep === -1 && (
            <motion.div layoutId="player" className="absolute z-30">
              <PlayerCharacter cfg={cfg.player} />
            </motion.div>
          )}
        </div>

        {/* Steps */}
        {bridge.map((step, idx) => {
          const isRevealed = revealedSteps.includes(idx);
          const isPending  = pendingStep === idx;
          const isNextStep = idx === currentStep + 1;
          const isAskedQuestion = isJumping ? (idx === currentStep) : (idx === currentStep + 1);

          return (
            <div key={idx} className="flex gap-4 shrink-0">
              {(['left', 'right'] as Side[]).map((side) => (
                <AnswerTile
                  key={side}
                  side={side}
                  label={isAskedQuestion ? step[side].label : ""}
                  isCorrect={step.correctSide === side}
                  isRevealed={isRevealed}
                  isCurrent={currentStep === idx && playerSide === side}
                  isFalling={status === 'FALLING' && currentStep === idx && playerSide === side}
                  isSelected={isPending && playerSide === side}
                  isPending={isPending}
                  onClick={() => isNextStep && onJump(side, idx)}
                  disabled={!isNextStep || status === 'FALLING' || isJumping}
                  cfg={cfg}
                />
              ))}
            </div>
          );
        })}

        {/* Start */}
        <div className="relative w-full h-28 bg-zinc-800/50 border-2 border-zinc-700 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-zinc-500 font-black uppercase tracking-widest text-lg">{cfg.copy.startLabel}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function SquidGame(): React.ReactElement {
  const cfg = GAME_CONFIG;
  const { revealDelay, fallAnimDuration } = cfg.settings;

  const [status,        setStatus]        = useState<GameStatus>('START');
  const [bridge,        setBridge]        = useState<Question[]>([]);
  const [currentStep,   setCurrentStep]   = useState<number>(-1);
  const [playerSide,    setPlayerSide]    = useState<Side | null>(null);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [pendingStep,   setPendingStep]   = useState<number | null>(null);
  const [isJumping,     setIsJumping]     = useState<boolean>(false);

  const initGame = useCallback((): void => {
    setBridge([...QUESTIONS]);
    setCurrentStep(-1);
    setPlayerSide(null);
    setRevealedSteps([]);
    setPendingStep(null);
    setStatus('PLAYING');
    setIsJumping(false);
  }, []);

  const handleJump = (side: Side, stepIdx: number): void => {
    if (status !== 'PLAYING' || isJumping) return;

    setIsJumping(true);
    setPlayerSide(side);
    setCurrentStep(stepIdx);
    setPendingStep(stepIdx);

    setTimeout(() => {
      setPendingStep(null);
      setRevealedSteps((prev) => [...prev, stepIdx]);
      const isCorrect = bridge[stepIdx]?.correctSide === side;

      if (!isCorrect) {
        setStatus('FALLING');
        setTimeout(() => {
          setStatus('GAME_OVER');
          setIsJumping(false);
        }, fallAnimDuration);
      } else {
        setIsJumping(false);
        if (stepIdx === bridge.length - 1) {
          setStatus('WON');
          confetti(cfg.settings.confetti);
        }
      }
    }, revealDelay);
  };

  return (
    <div className={`min-h-screen ${cfg.theme.bg} ${cfg.theme.text} font-sans selection:bg-rose-500/30 flex flex-col items-center justify-center p-4 overflow-hidden`}>
      <div className={`fixed inset-0 ${cfg.theme.gridLine} pointer-events-none`} />

      <AnimatePresence mode="wait">
        {status === 'START' && (
          <StartScreen key="start" onStart={initGame} totalSteps={QUESTIONS.length} cfg={cfg} />
        )}
        {status === 'GAME_OVER' && (
          <GameOverScreen key="game-over" currentStep={currentStep} totalSteps={bridge.length} onRetry={initGame} cfg={cfg} />
        )}
        {status === 'WON' && (
          <WinScreen key="won" onRetry={initGame} cfg={cfg} />
        )}
        {(status === 'PLAYING' || status === 'FALLING') && (
          <GameBoard
            key="board"
            bridge={bridge}
            currentStep={currentStep}
            playerSide={playerSide}
            revealedSteps={revealedSteps}
            pendingStep={pendingStep}
            status={status}
            isJumping={isJumping}
            onJump={handleJump}
            cfg={cfg}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
}
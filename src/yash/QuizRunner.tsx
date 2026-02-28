/**
 * QuizRunner.tsx
 *
 * Full game component — do NOT edit for question changes.
 * To change questions/answers, edit questions.ts only.
 *
 * Usage:
 *   import QuizRunner from './QuizRunner';
 *   <QuizRunner />
 *
 * Requires React 18+ and a bundler that supports CSS-in-JS via
 * inline styles (no external stylesheet needed).
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { QUESTIONS, type Question } from './questions';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface PreparedQuestion {
  q: string;
  opts: [string, string];
  correct: 0 | 1;
}

interface Gate {
  dz: number;
  leftLabel: string;
  rightLabel: string;
  answered: boolean;
}

interface Obstacle {
  dz: number;
  wx: number;
  hit: boolean;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; decay: number;
  r: number; color: string;
}

interface SpeedLine {
  x: number; y: number; len: number; sp: number;
}

type GameScreen     = 'start' | 'playing' | 'gameover';
type GameOverReason = 'wrong' | 'timeout' | 'obstacle';
type CharState      = 'normal' | 'boost' | 'debuff';

// ─────────────────────────────────────────────────────────────
// PURE GAME CONSTANTS  (never need editing)
// ─────────────────────────────────────────────────────────────
const DRAW_DEPTH       = 12;   // how many "world units" are visible
const WORLD_SPEED_BASE = 3.5;  // objects move this many units/sec at speed×1
const Q_TIMER_MAX      = 10;   // seconds per question
const ROAD_BOUND       = 0.93; // player can't go beyond ±this in normalised X
const ACCEL            = 6.5;  // lateral acceleration
const DECEL            = 10;   // lateral friction
const MAX_VX           = 0.9;  // max lateral speed

const FONT = "'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif";

const CLOUDS = [
  { x: 0.10, y: 0.07, w: 100, h: 44 },
  { x: 0.38, y: 0.04, w: 130, h: 55 },
  { x: 0.65, y: 0.09, w:  90, h: 38 },
  { x: 0.85, y: 0.05, w: 115, h: 48 },
];

// ─────────────────────────────────────────────────────────────
// QUESTION HELPERS  (pure functions, isolated from game state)
// ─────────────────────────────────────────────────────────────

/** Pick a random question from the imported list and randomly
 *  flip the left/right position so the correct side varies. */
function pickQuestion(): PreparedQuestion {
  const raw  = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  const flip = Math.random() < 0.5;
  return {
    q:       raw.q,
    opts:    flip ? [raw.opts[1], raw.opts[0]] : [raw.opts[0], raw.opts[1]],
    correct: flip ? ((1 - raw.correct) as 0 | 1) : raw.correct,
  };
}

// ─────────────────────────────────────────────────────────────
// CANVAS HELPERS
// ─────────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((ctx as any).roundRect) (ctx as any).roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// MUTABLE GAME STATE  (lives in a ref, never triggers re-renders)
// ─────────────────────────────────────────────────────────────
interface GameState {
  // lifecycle
  running:  boolean;
  dying:    boolean;
  raf:      number;
  lastT:    number;

  // viewport
  W: number;
  H: number;

  // scores
  score:      number;
  multiplier: number;
  streak:     number;

  // physics
  gameSpeed:  number;
  boostTimer: number;
  debuffTimer:number;

  // player
  px:         number;   // normalised: -1 = left edge, +1 = right edge
  pvx:        number;   // lateral velocity
  playerTilt: number;
  runPhase:   number;

  // question
  questionActive: boolean;
  answered:       boolean;
  currentQ:       PreparedQuestion | null;
  qTimer:         number;
  timeSinceLast:  number;

  // world objects
  gates:        Gate[];
  obstacles:    Obstacle[];
  nextObstDist: number;

  // fx
  particles:      Particle[];
  speedLines:     SpeedLine[];
  roadStripePhase:number;
}

function makeInitialState(): GameState {
  return {
    running: false, dying: false, raf: 0, lastT: 0,
    W: 0, H: 0,
    score: 0, multiplier: 1, streak: 0,
    gameSpeed: 1, boostTimer: 0, debuffTimer: 0,
    px: 0, pvx: 0, playerTilt: 0, runPhase: 0,
    questionActive: false, answered: false, currentQ: null,
    qTimer: 0, timeSinceLast: 0,
    gates: [], obstacles: [], nextObstDist: 5,
    particles: [], speedLines: [], roadStripePhase: 0,
  };
}

// ─────────────────────────────────────────────────────────────
// REACT UI STATE  (only what's needed for HTML overlay renders)
// ─────────────────────────────────────────────────────────────
interface UIState {
  screen:      GameScreen;
  score:       number;
  multiplier:  number;
  speed:       number;
  timerPct:    number;
  showTimer:   boolean;
  streakNum:   number;
  showStreak:  boolean;
  questionText:string;
  ansLeft:     string;
  ansRight:    string;
  showQuestion:boolean;
  showKeyGuide:boolean;
  feedback:    string;
  feedbackOk:  boolean;
  flashColor:  string;
  goEmoji:     string;
  goReason:    string;
  finalScore:  number;
}

const INITIAL_UI: UIState = {
  screen: 'start',
  score: 0, multiplier: 1, speed: 1,
  timerPct: 100, showTimer: false,
  streakNum: 0, showStreak: false,
  questionText: '', ansLeft: '', ansRight: '',
  showQuestion: false, showKeyGuide: false,
  feedback: '', feedbackOk: true,
  flashColor: '',
  goEmoji: '💥', goReason: '', finalScore: 0,
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function QuizRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GameState>(makeInitialState());
  const keysRef   = useRef<Record<string, boolean>>({});

  // UI state stored in a ref + force-update so React only
  // re-renders the overlay, not the canvas each frame.
  const uiRef     = useRef<UIState>({ ...INITIAL_UI });
  const [, setTick] = React.useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  function ui(): UIState { return uiRef.current; }
  function patchUI(patch: Partial<UIState>) {
    Object.assign(uiRef.current, patch);
    forceUpdate();
  }

  // ── Perspective helpers (depend on gs.W / gs.H) ──────────
  function roadHalf(): number {
    const { W, H } = gsRef.current;
    return Math.min(W, H) * 0.34;
  }
  function horizY(): number { return gsRef.current.H * 0.30; }
  function baseY():  number { return gsRef.current.H * 0.80; }

  function d2s(wx: number, dz: number) {
    const t  = Math.min(dz / DRAW_DEPTH, 1);
    const sy = baseY() - (baseY() - horizY()) * t;
    const sc = 1 - t * 0.90;
    return { x: gsRef.current.W / 2 + wx * roadHalf() * sc, y: sy, sc };
  }

  function edgeX(side: number, dz: number): number {
    const t  = Math.min(dz / DRAW_DEPTH, 1);
    return gsRef.current.W / 2 + side * roadHalf() * (1 - t * 0.90);
  }

  // ── Particle helpers ─────────────────────────────────────
  function spawnParticles(good: boolean) {
    const g  = gsRef.current;
    const cx = g.W / 2 + g.px * roadHalf();
    const cy = baseY() - 40;
    const c1 = good ? '#44d977' : '#ff3333';
    const c2 = good ? '#ffffff' : '#ffaaaa';
    for (let i = 0; i < 38; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 10 + 2;
      g.particles.push({
        x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5,
        life: 1, decay: 0.02 + Math.random() * 0.018,
        r: Math.random() * 7 + 3, color: Math.random() < 0.6 ? c1 : c2,
      });
    }
  }

  // ── Question flow ────────────────────────────────────────
  const hideQuestion = useCallback(() => {
    gsRef.current.questionActive = false;
    patchUI({ showQuestion: false, showTimer: false, showKeyGuide: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showQuestion = useCallback(() => {
    const g = gsRef.current;
    if (g.questionActive) return;
    const q = pickQuestion();
    g.questionActive = true;
    g.answered       = false;
    g.currentQ       = q;
    g.qTimer         = Q_TIMER_MAX;
    g.gates.push({
      dz: DRAW_DEPTH * 0.92,
      leftLabel:  q.opts[0],
      rightLabel: q.opts[1],
      answered:   false,
    });
    patchUI({
      showQuestion: true, showTimer: true, timerPct: 100,
      questionText: q.q, ansLeft: q.opts[0], ansRight: q.opts[1],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Game over ─────────────────────────────────────────────
  const doGameOver = useCallback((reason: GameOverReason) => {
    const g = gsRef.current;
    if (g.dying || !g.running) return;
    g.dying   = true;
    g.running = false;
    cancelAnimationFrame(g.raf);
    spawnParticles(false);
    hideQuestion();

    const emoji    = reason === 'obstacle' ? '🚧' : reason === 'timeout' ? '⏱️' : '❌';
    const subtitle = reason === 'obstacle' ? 'HIT AN OBSTACLE!'
                   : reason === 'timeout'  ? 'RAN OUT OF TIME!'
                   :                         'WRONG ANSWER!';

    patchUI({ flashColor: 'rgba(255,0,30,0.5)' });

    // Brief particle-only death animation
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (canvas && ctx) {
      let df = 0;
      const deathLoop = () => {
        df++;
        ctx.clearRect(0, 0, g.W, g.H);
        drawBg(ctx); drawRoad(ctx); tickParticles(ctx); drawVignette(ctx);
        if (df < 35) requestAnimationFrame(deathLoop);
      };
      requestAnimationFrame(deathLoop);
    }

    setTimeout(() => patchUI({ flashColor: '' }), 400);
    setTimeout(() => patchUI({
      screen: 'gameover', goEmoji: emoji, goReason: subtitle,
      finalScore: Math.floor(g.score),
    }), 700);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideQuestion]);

  // ── Answer resolution ────────────────────────────────────
  const triggerAnswer = useCallback((side: 0 | 1) => {
    const g = gsRef.current;
    if (!g.questionActive || g.answered || !g.currentQ) return;
    g.answered = true;

    if (side === g.currentQ.correct) {
      // ✅ CORRECT → boost and continue
      g.streak++;
      g.multiplier  = Math.min(g.multiplier + 1, 8);
      g.gameSpeed   = Math.min(g.gameSpeed + 0.35, 4.0);
      g.boostTimer  = 2.8;
      spawnParticles(true);
      const txt = g.streak >= 3 ? `🔥 ×${g.multiplier} COMBO!` : '✓ CORRECT!';
      hideQuestion();
      patchUI({
        feedback: txt, feedbackOk: true,
        flashColor: 'rgba(68,217,119,0.18)',
        showStreak: g.streak >= 3, streakNum: g.streak,
      });
      setTimeout(() => patchUI({ feedback: '', flashColor: '' }), 1500);
    } else {
      // ❌ WRONG → game over
      doGameOver('wrong');
    }
    g.timeSinceLast = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideQuestion, doGameOver]);

  const questionTimeout = useCallback(() => {
    const g = gsRef.current;
    if (!g.questionActive || g.answered) return;
    g.answered      = true;
    g.timeSinceLast = 0;
    doGameOver('timeout');
  }, [doGameOver]);

  // ── Start / reset ─────────────────────────────────────────
  const startGame = useCallback(() => {
    const g = gsRef.current;
    cancelAnimationFrame(g.raf);

    // Reset all mutable game state
    g.running = false; g.dying = false; g.raf = 0;
    g.score = 0; g.multiplier = 1; g.streak = 0;
    g.gameSpeed = 1; g.boostTimer = 0; g.debuffTimer = 0;
    g.px = 0; g.pvx = 0; g.playerTilt = 0; g.runPhase = 0;
    g.questionActive = false; g.answered = false; g.currentQ = null;
    g.qTimer = 0; g.timeSinceLast = 0;
    g.gates = []; g.obstacles = []; g.nextObstDist = 5;
    g.particles = []; g.roadStripePhase = 0;
    g.speedLines = Array.from({ length: 28 }, () => ({
      x: Math.random(), y: Math.random(),
      len: Math.random() * 0.06 + 0.02, sp: Math.random() * 0.18 + 0.08,
    }));

    patchUI({ ...INITIAL_UI, screen: 'playing' });

    g.running = true;
    g.lastT   = performance.now();
    requestAnimationFrame(gameLoop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────
  // DRAW FUNCTIONS  (all take ctx, read from gsRef internally)
  // ─────────────────────────────────────────────────────────

  function drawBg(ctx: CanvasRenderingContext2D) {
    const { W, H } = gsRef.current;
    const hy = horizY();

    // Sky
    const sg = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    sg.addColorStop(0, '#5bc8f5'); sg.addColorStop(1, '#9adcf8');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.5);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    for (const c of CLOUDS) {
      const cx = c.x * W, cy = c.y * H, hw = c.w / 2, hh = c.h / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, hw, hh, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + hw * 0.55, cy - hh * 0.30, hw * 0.65, hh * 0.80, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - hw * 0.45, cy - hh * 0.15, hw * 0.55, hh * 0.70, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    const gg = ctx.createLinearGradient(0, hy, 0, H);
    gg.addColorStop(0, '#d8edf5'); gg.addColorStop(1, '#c8e0ee');
    ctx.fillStyle = gg; ctx.fillRect(0, hy, W, H - hy);

    // Side pillars
    const py = baseY();
    for (let i = 0; i < 7; i++) {
      const t  = i / 7;
      const dz = t * DRAW_DEPTH;
      const sc = 1 - t * 0.88;
      const lx = edgeX(-1, dz) - 14 * sc;
      const rx = edgeX(1,  dz) + 14 * sc;
      const sy = hy + (py - hy) * (1 - t);
      const pw = 26 * sc;
      const ph = (py - hy) * (1 - t) + 50;

      for (const bx of [lx, rx]) {
        const il = bx < W / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.07)';
        ctx.fillRect(bx - pw / 2 + pw * 0.2, sy - ph, pw * 0.7, ph);
        const pg = ctx.createLinearGradient(bx - pw / 2, 0, bx + pw / 2, 0);
        pg.addColorStop(0,   il ? '#c0d8e8' : '#b0ccd8');
        pg.addColorStop(0.5, '#e8f4f8');
        pg.addColorStop(1,   il ? '#b0ccd8' : '#c0d8e8');
        ctx.fillStyle = pg;
        ctx.fillRect(bx - pw / 2, sy - ph, pw, ph);
        ctx.fillStyle = '#d8eaf0';
        ctx.fillRect(bx - pw / 2 - 3, sy - ph - pw * 0.45, pw + 6, pw * 0.45);
      }
    }
  }

  function drawRoad(ctx: CanvasRenderingContext2D) {
    const g  = gsRef.current;
    const hy = horizY(), py = baseY() + 60;
    const lT = edgeX(-1, DRAW_DEPTH), rT = edgeX(1, DRAW_DEPTH);
    const lB = edgeX(-1, 0),          rB = edgeX(1, 0);

    ctx.beginPath();
    ctx.moveTo(lT, hy); ctx.lineTo(rT, hy); ctx.lineTo(rB, py); ctx.lineTo(lB, py);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, hy, 0, py);
    rg.addColorStop(0, '#e4ecf0'); rg.addColorStop(0.4, '#f2f8fa'); rg.addColorStop(1, '#ffffff');
    ctx.fillStyle = rg; ctx.fill();

    ctx.strokeStyle = 'rgba(180,200,215,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lT, hy); ctx.lineTo(lB, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rT, hy); ctx.lineTo(rB, py); ctx.stroke();

    // Centre dashes
    for (let i = 0; i < 16; i++) {
      const t0 = ((i     + g.roadStripePhase) % 16) / 16;
      const t1 = ((i + 0.38 + g.roadStripePhase) % 16) / 16;
      if (t0 >= t1) continue;
      const s0 = d2s(0, t0 * DRAW_DEPTH * 0.97);
      const s1 = d2s(0, t1 * DRAW_DEPTH * 0.97);
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y);
      ctx.strokeStyle = 'rgba(195,212,225,0.85)';
      ctx.lineWidth   = Math.max(1.5, s0.sc * 5); ctx.stroke();
    }
  }

  function drawGateShape(ctx: CanvasRenderingContext2D, gate: Gate) {
    const dz = gate.dz;
    if (dz > DRAW_DEPTH || dz < -0.8) return;
    const sc  = 1 - (dz / DRAW_DEPTH) * 0.88;
    const lx  = edgeX(-1, dz), rx = edgeX(1, dz), cx = (lx + rx) / 2;
    const y   = d2s(0, dz).y;
    const gw  = rx - lx;
    const bh  = Math.max(28, gw * 0.46);
    const bw  = (gw / 2 - 4) * 0.95;
    const pw  = Math.max(5, sc * 14);

    // Posts + crossbar
    ctx.fillStyle = '#d0e4ee';
    for (const bx of [lx, cx, rx])
      ctx.fillRect(bx - pw / 2, y - bh - pw, pw, bh + pw + 22 * sc);
    ctx.fillStyle = '#c4d8e4';
    ctx.fillRect(lx - pw / 2, y - bh - pw * 1.4, gw + pw, pw * 0.85);

    // Blue left box
    ctx.fillStyle = '#3a9fff'; roundRect(ctx, lx, y - bh, bw, bh, 8 * sc);
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; roundRect(ctx, lx + 5 * sc, y - bh + 5 * sc, bw * 0.42, bh * 0.3, 5 * sc);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(11, Math.floor(sc * 26))}px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(gate.leftLabel, lx + bw / 2, y - bh / 2);

    // Red right box
    ctx.fillStyle = '#ff5a5a'; roundRect(ctx, cx + 5, y - bh, bw, bh, 8 * sc);
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; roundRect(ctx, cx + 5 + 5 * sc, y - bh + 5 * sc, bw * 0.42, bh * 0.3, 5 * sc);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(11, Math.floor(sc * 26))}px ${FONT}`;
    ctx.fillText(gate.rightLabel, cx + 5 + bw / 2, y - bh / 2);

    // Floor tint arrows when close
    if (dz < DRAW_DEPTH * 0.5) {
      const a = Math.min(1, (DRAW_DEPTH * 0.5 - dz) / (DRAW_DEPTH * 0.2)) * 0.7;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(58,159,255,0.25)';  ctx.fillRect(lx,    y, bw,      60 * sc);
      ctx.fillStyle = 'rgba(255,90,90,0.25)';   ctx.fillRect(cx + 5, y, bw,     60 * sc);
      ctx.globalAlpha = 1;
    }
  }

  function tickGates(ctx: CanvasRenderingContext2D, dt: number) {
    const g    = gsRef.current;
    const move = g.gameSpeed * dt * WORLD_SPEED_BASE;
    let needGuide = false;

    for (let i = g.gates.length - 1; i >= 0; i--) {
      const gate = g.gates[i];
      gate.dz -= move;

      // Remove immediately once answered or past player
      if (gate.answered || gate.dz < -1) { g.gates.splice(i, 1); continue; }
      if (gate.dz > DRAW_DEPTH)          continue;

      drawGateShape(ctx, gate);

      // Collision detection: gate reaches player plane
      if (!gate.answered && gate.dz < 0.4 && gate.dz > -0.3) {
        gate.answered = true;
        triggerAnswer(g.px < 0 ? 0 : 1);
      }

      // Show key guide hint when gate is approaching
      if (!gate.answered && gate.dz < DRAW_DEPTH * 0.45 && gate.dz > 0.5
          && g.questionActive && !g.answered) {
        needGuide = true;
      }
    }

    if (uiRef.current.showKeyGuide !== needGuide)
      patchUI({ showKeyGuide: needGuide });
  }

  function tickObstacles(ctx: CanvasRenderingContext2D, dt: number) {
    const g    = gsRef.current;
    const move = g.gameSpeed * dt * WORLD_SPEED_BASE;

    g.nextObstDist -= move;
    if (g.nextObstDist <= 0 && !g.questionActive) {
      if (Math.random() < 0.4) {
        const side = (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 0.6);
        g.obstacles.push({ dz: DRAW_DEPTH * 0.9, wx: side, hit: false });
      }
      g.nextObstDist = 3 + Math.random() * 3;
    }

    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      const ob = g.obstacles[i];
      ob.dz -= move;
      if (ob.dz < -0.5) { g.obstacles.splice(i, 1); continue; }

      const p  = d2s(ob.wx, ob.dz);
      const sz = Math.max(5, p.sc * 44);

      // Collision
      if (!ob.hit && ob.dz < 0.4 && ob.dz > -0.4) {
        ob.hit = true;
        const psx = g.W / 2 + g.px * roadHalf();
        if (Math.abs(psx - p.x) < 36) { doGameOver('obstacle'); return; }
      }

      // Draw triangle
      ctx.fillStyle   = '#ff5a5a';
      ctx.strokeStyle = '#cc2020';
      ctx.lineWidth   = 2 * p.sc;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - sz);
      ctx.lineTo(p.x - sz * 0.75, p.y + sz * 0.28);
      ctx.lineTo(p.x + sz * 0.75, p.y + sz * 0.28);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.fillStyle = 'rgba(255,90,90,0.18)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + sz * 0.28 + 3, sz * 0.7, sz * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Character drawing ─────────────────────────────────────
  function drawLeg(
    ctx: CanvasRenderingContext2D,
    ox: number, oy: number, angle: number,
    body: string, dark: string,
  ) {
    ctx.save(); ctx.translate(ox, oy);
    ctx.save(); ctx.rotate(angle * 0.65);
    ctx.fillStyle = body;
    ctx.beginPath(); roundRect(ctx, -5, 0, 10, 14, 3);
    ctx.translate(0, 14); ctx.rotate(Math.max(0, angle) * 0.7);
    ctx.fillStyle = dark;
    ctx.beginPath(); roundRect(ctx, -4, 0, 8, 14, 3);
    ctx.translate(0, 14);
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(angle > 0 ? 4 : 0, 0, 7, 3.5, angle * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); ctx.restore();
  }

  function drawArm(
    ctx: CanvasRenderingContext2D,
    ox: number, oy: number, angle: number,
    body: string, dark: string, dir: number,
  ) {
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(dir * 0.3 + angle * 0.6);
    ctx.fillStyle = body; roundRect(ctx, -4, 0, 8, 15, 3);
    ctx.translate(0, 14); ctx.rotate(dir * 0.1 + angle * 0.35);
    ctx.fillStyle = dark; roundRect(ctx, -3, 0, 6, 12, 3);
    ctx.restore();
  }

  function drawCharacter(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, phase: number, tilt: number, state: CharState,
  ) {
    const BODY = state === 'boost'  ? '#44d977' : state === 'debuff' ? '#ff5a5a' : '#3a9fff';
    const DARK = state === 'boost'  ? '#22a955' : state === 'debuff' ? '#cc2020' : '#1a6fbf';
    const SKIN = '#ffcba0';

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt * 0.16);

    // Shadow
    ctx.beginPath(); ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.13)'; ctx.fill();

    // Legs
    drawLeg(ctx, -6, 0, Math.sin(phase) * 0.52,            BODY, DARK);
    drawLeg(ctx,  6, 0, Math.sin(phase + Math.PI) * 0.52,  BODY, DARK);

    // Body
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 8;
    ctx.fillStyle = BODY; roundRect(ctx, -11, -32, 22, 34, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.ellipse(-3, -20, 6, 10, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();

    // Arms
    drawArm(ctx, -11, -24, Math.sin(phase + Math.PI) * 0.48, BODY, DARK, -1);
    drawArm(ctx,  11, -24, Math.sin(phase)           * 0.48, BODY, DARK,  1);

    // Head
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 6;
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, -46, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = BODY; ctx.beginPath(); ctx.arc(0, -46, 13, Math.PI, 0);     ctx.fill();
    ctx.shadowBlur = 0;
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-4.5, -47, 3.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 4.5, -47, 3.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-4, -47, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 5, -47, 1.8, 0, Math.PI * 2); ctx.fill();
    // Mouth
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    if (state === 'boost')       ctx.arc(0, -43, 5, 0.1, Math.PI - 0.1);
    else if (state === 'debuff') ctx.arc(0, -40, 5, Math.PI + 0.2, -0.2);
    else { ctx.moveTo(-4, -42); ctx.lineTo(4, -42); }
    ctx.stroke();
    ctx.restore();

    // Boost aura
    if (state === 'boost') {
      ctx.globalAlpha = 0.3;
      const aura = ctx.createRadialGradient(0, -20, 5, 0, -20, 40);
      aura.addColorStop(0, '#44d977'); aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura; ctx.fillRect(-45, -70, 90, 90);
      ctx.globalAlpha = 1;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(
          (Math.random() - 0.5) * 16,
          Math.random() * 20 + 5,
          Math.random() * 4 + 1, 0, Math.PI * 2,
        );
        ctx.fillStyle = `rgba(68,217,119,${Math.random() * 0.6 + 0.2})`; ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSpeedLines(ctx: CanvasRenderingContext2D) {
    const g = gsRef.current;
    if (g.gameSpeed < 1.4 && g.boostTimer <= 0) return;
    const alpha = Math.min((g.gameSpeed - 1.2) * 0.12 + g.boostTimer * 0.09, 0.38);
    ctx.globalAlpha = alpha;
    for (const sl of g.speedLines) {
      sl.y += sl.sp * 0.016 * g.gameSpeed;
      if (sl.y > 1) sl.y = -sl.len;
      ctx.beginPath();
      ctx.moveTo(sl.x * g.W, sl.y * g.H);
      ctx.lineTo(sl.x * g.W, (sl.y + sl.len) * g.H);
      ctx.strokeStyle = g.boostTimer > 0 ? 'rgba(68,217,119,0.9)' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function tickParticles(ctx: CanvasRenderingContext2D) {
    const g = gsRef.current;
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.95;
      p.life -= p.decay;
      if (p.life <= 0) { g.particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawVignette(ctx: CanvasRenderingContext2D) {
    const { W, H } = gsRef.current;
    const vg = ctx.createRadialGradient(W/2, H*0.5, H*0.1, W/2, H*0.5, H*0.75);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,20,40,0.15)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  // ─────────────────────────────────────────────────────────
  // MAIN GAME LOOP
  // ─────────────────────────────────────────────────────────
  function gameLoop(now: number) {
    const g = gsRef.current;
    if (!g.running) return;

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dt = Math.min((now - g.lastT) / 1000, 0.05);
    g.lastT  = now;

    // Timers
    if (g.boostTimer  > 0) g.boostTimer  -= dt;
    if (g.debuffTimer > 0) g.debuffTimer -= dt;

    // ── Input ──
    const kl = keysRef.current['ArrowLeft']  || keysRef.current['KeyA'];
    const kr = keysRef.current['ArrowRight'] || keysRef.current['KeyD'];
    const ku = keysRef.current['ArrowUp']    || keysRef.current['KeyW'];
    const kd = keysRef.current['ArrowDown']  || keysRef.current['KeyS'];

    if (kl)      g.pvx = Math.max(g.pvx - ACCEL * dt, -MAX_VX);
    else if (kr) g.pvx = Math.min(g.pvx + ACCEL * dt,  MAX_VX);
    else         g.pvx *= Math.max(0, 1 - DECEL * dt);

    if (ku)      g.gameSpeed = Math.min(g.gameSpeed + dt * 0.8, g.boostTimer > 0 ? 4.5 : 3.5);
    else if (kd) g.gameSpeed = Math.max(g.gameSpeed - dt * 0.8, 0.3);

    g.px = Math.max(-ROAD_BOUND, Math.min(ROAD_BOUND, g.px + g.pvx * dt));
    g.playerTilt += (g.pvx * 0.55 - g.playerTilt) * Math.min(dt * 10, 1);
    g.playerTilt  = Math.max(-0.5, Math.min(0.5, g.playerTilt));

    const spd = Math.abs(g.pvx) * 2 + g.gameSpeed;
    if (spd > 0.2) g.runPhase += dt * spd * 3.5;
    g.roadStripePhase += g.gameSpeed * dt * 1.8;

    // ── Score ──
    g.score += dt * 22 * g.gameSpeed * g.multiplier;

    // ── Question timer ──
    if (!g.questionActive) {
      g.timeSinceLast += dt;
      if (g.timeSinceLast >= Math.max(4, 7 - g.gameSpeed * 0.5)) showQuestion();
    } else if (!g.answered) {
      g.qTimer -= dt;
      const pct = Math.max(0, (g.qTimer / Q_TIMER_MAX) * 100);
      patchUI({ timerPct: pct, score: Math.floor(g.score), multiplier: g.multiplier, speed: g.gameSpeed });
      if (g.qTimer <= 0) questionTimeout();
    } else {
      patchUI({ score: Math.floor(g.score), multiplier: g.multiplier, speed: g.gameSpeed });
    }

    // ── Render ──
    ctx.clearRect(0, 0, g.W, g.H);
    drawBg(ctx);
    drawSpeedLines(ctx);
    drawRoad(ctx);
    tickObstacles(ctx, dt);
    tickGates(ctx, dt);

    const state: CharState = g.debuffTimer > 0 ? 'debuff' : g.boostTimer > 0 ? 'boost' : 'normal';
    drawCharacter(ctx, g.W / 2 + g.px * roadHalf(), baseY(), g.runPhase, g.playerTilt, state);
    tickParticles(ctx);
    drawVignette(ctx);

    g.raf = requestAnimationFrame(gameLoop);
  }

  // ─────────────────────────────────────────────────────────
  // MOUNT / UNMOUNT
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Inject Google Font
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = 'https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap';
    document.head.appendChild(link);

    // Canvas resize
    const canvas = canvasRef.current!;
    const resize = () => {
      gsRef.current.W = canvas.width  = window.innerWidth;
      gsRef.current.H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Key events
    const kd = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup',   ku);

    return () => {
      window.removeEventListener('resize',  resize);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup',   ku);
      cancelAnimationFrame(gsRef.current.raf);
      document.head.removeChild(link);
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  const u = ui();

  // Shared button style
  const btnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg,#3a9fff,#1a7fdf)', color: '#fff',
    border: 'none', borderRadius: 16, fontFamily: FONT, fontSize: 18,
    fontWeight: 900, padding: '15px 46px', cursor: 'pointer',
    boxShadow: '0 6px 0 #1a6fbf',
  };
  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 28, padding: '38px 48px',
    textAlign: 'center', boxShadow: '0 20px 60px rgba(0,100,200,0.18)',
    maxWidth: 400, width: '92%',
  };
  const screenStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', zIndex: 50,
    background: 'linear-gradient(180deg,#5bc8f5,#a0e0ff)',
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: FONT }}>

      {/* ── CANVAS ── */}
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* ── HUD ── */}
      {u.screen === 'playing' && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', display:'flex', justifyContent:'space-between', padding:'16px 20px', pointerEvents:'none', zIndex:10 }}>
          {[
            { label: 'Score', value: u.score.toLocaleString(),     color: '#333'    },
            { label: 'Speed', value: `${u.speed.toFixed(1)}×`,     color: '#3a9fff' },
            { label: 'Multi', value: `×${u.multiplier}`,           color: '#ff5a5a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.92)', borderRadius:14, padding:'10px 18px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:'#aaa', textTransform:'uppercase' }}>{label}</div>
              <div style={{ fontSize:label==='Speed'?20:26, fontWeight:900, color, lineHeight:1, marginTop:2 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TIMER BAR ── */}
      {u.showTimer && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:5, background:'rgba(0,0,0,0.08)', zIndex:25 }}>
          <div style={{ height:'100%', width:`${u.timerPct}%`, background:'linear-gradient(90deg,#3a9fff,#ff5a5a)', transition:'width 0.1s linear' }} />
        </div>
      )}

      {/* ── STREAK BADGE ── */}
      {u.showStreak && (
        <div style={{ position:'fixed', top:85, left:'50%', transform:'translateX(-50%)', background:'#ff5a5a', color:'#fff', borderRadius:20, padding:'7px 18px', fontSize:14, fontWeight:900, letterSpacing:1, pointerEvents:'none', boxShadow:'0 4px 12px rgba(255,90,90,0.4)', zIndex:15 }}>
          🔥 {u.streakNum} STREAK!
        </div>
      )}

      {/* ── QUESTION PANEL ── */}
      <div style={{
        position:'fixed', left:0, bottom:0, width:'100%',
        background:'linear-gradient(transparent, rgba(255,255,255,0.97) 20%)',
        padding:'16px 24px 22px',
        transform: u.showQuestion ? 'translateY(0)' : 'translateY(110%)',
        transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        zIndex:20, pointerEvents:'none',
      }}>
        <div style={{ fontSize:19, fontWeight:800, color:'#222', textAlign:'center', marginBottom:10, lineHeight:1.3 }}>
          {u.questionText}
        </div>
        <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'#aaa', letterSpacing:1 }}>
          <span style={{ color:'#3a9fff', fontWeight:900 }}>← {u.ansLeft}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span style={{ color:'#ff5a5a', fontWeight:900 }}>{u.ansRight} →</span>
        </div>
      </div>

      {/* ── KEY GUIDE ── */}
      {u.showKeyGuide && u.showQuestion && (
        <div style={{ position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)', display:'flex', gap:60, pointerEvents:'none', zIndex:15 }}>
          {([
            { arrow:'←', label: u.ansLeft,  color:'#3a9fff', bg:'rgba(58,159,255,0.12)'  },
            { arrow:'→', label: u.ansRight, color:'#ff5a5a', bg:'rgba(255,90,90,0.12)'   },
          ] as const).map(({ arrow, label, color, bg }) => (
            <div key={arrow} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ fontSize:28, fontWeight:900, padding:'6px 14px', borderRadius:10, border:`3px solid ${color}`, background:bg, color, lineHeight:1 }}>{arrow}</div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:1, maxWidth:120, textAlign:'center', lineHeight:1.3, color }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── FEEDBACK ── */}
      {u.feedback && (
        <div style={{ position:'fixed', top:'38%', left:'50%', transform:'translate(-50%,-50%)', fontSize:52, fontWeight:900, pointerEvents:'none', whiteSpace:'nowrap', textShadow:'0 4px 0 rgba(0,0,0,0.12)', color: u.feedbackOk ? '#44d977' : '#ff3333', zIndex:20 }}>
          {u.feedback}
        </div>
      )}

      {/* ── FLASH ── */}
      {u.flashColor && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:u.flashColor, pointerEvents:'none', zIndex:30 }} />
      )}

      {/* ── START SCREEN ── */}
      {u.screen === 'start' && (
        <div style={screenStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize:54, fontWeight:900, color:'#222', lineHeight:1 }}>🏃 QUIZ<br />RUSH</div>
            <div style={{ fontSize:13, fontWeight:800, color:'#aaa', letterSpacing:3, textTransform:'uppercase', margin:'8px 0 26px' }}>Move • Answer • Win</div>
            <button style={btnStyle} onClick={startGame}>TAP TO RUN!</button>
            <div style={{ fontSize:12, fontWeight:700, color:'#ccc', marginTop:18, lineHeight:2.3 }}>
              <b style={{ color:'#aaa' }}>MOVE:</b> Arrow Keys / WASD<br />
              <b style={{ color:'#aaa' }}>↑ / ↓</b> — speed up or slow down<br />
              <b style={{ color:'#aaa' }}>← / →</b> — steer &amp; dodge<br />
              Run through a gate to answer. Wrong = game over!
            </div>
          </div>
        </div>
      )}

      {/* ── GAME OVER SCREEN ── */}
      {u.screen === 'gameover' && (
        <div style={screenStyle}>
          <div style={cardStyle}>
            <div style={{ fontSize:64, lineHeight:1, marginBottom:6 }}>{u.goEmoji}</div>
            <div style={{ fontSize:14, fontWeight:900, letterSpacing:3, textTransform:'uppercase', color:'#ff5a5a', marginBottom:8 }}>{u.goReason}</div>
            <div style={{ fontSize:62, fontWeight:900, color:'#ff5a5a', margin:'6px 0 4px' }}>{u.finalScore.toLocaleString()}</div>
            <div style={{ fontSize:11, fontWeight:800, color:'#bbb', letterSpacing:3, marginBottom:28 }}>FINAL SCORE</div>
            <button style={btnStyle} onClick={startGame}>TRY AGAIN!</button>
          </div>
        </div>
      )}

    </div>
  );
}

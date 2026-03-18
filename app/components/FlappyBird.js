'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './FlappyBird.module.css';

// ── Canvas dimensions ────────────────────────────────────────
const W = 480, H = 540;

// ── Bird ─────────────────────────────────────────────────────
const BIRD_X   = 90;
const BIRD_R   = 14;
const GRAVITY  = 0.46;
const FLAP_VEL = -9.5;

// ── Pipes ────────────────────────────────────────────────────
const PIPE_W     = 58;
const PIPE_GAP   = 162;
const PIPE_SPEED = 2.8;
const PIPE_EVERY = 90; // frames between spawns

// ── Leaderboard helpers ───────────────────────────────────────
const LB_KEY = 'mk_flappy_lb';

function getLB() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); }
  catch { return []; }
}

function pushLB(name, score) {
  const updated = [...getLB(), { name: (name || 'Anonymous').trim().slice(0, 20), score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem(LB_KEY, JSON.stringify(updated));
  return updated;
}

// ── Drawing helpers ───────────────────────────────────────────
function drawScene(ctx, g) {
  // Background
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(139,92,246,0.055)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Pipes
  for (const { x, topH } of g.pipes) {
    const grad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
    grad.addColorStop(0, '#5b21b6');
    grad.addColorStop(1, '#3b0764');

    // top body
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, 0, PIPE_W, topH - 12, [0, 0, 6, 6]);
    ctx.fill();
    // top cap
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(x - 5, topH - 14, PIPE_W + 10, 14);

    // bottom body
    const botY = topH + PIPE_GAP + 14;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, botY, PIPE_W, H - botY, [6, 6, 0, 0]);
    ctx.fill();
    // bottom cap
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(x - 5, topH + PIPE_GAP, PIPE_W + 10, 14);
  }

  // Bird
  ctx.save();
  ctx.translate(BIRD_X, g.bird.y);
  ctx.rotate(Math.max(-0.45, Math.min(0.75, g.bird.vy * 0.055)));

  // glow
  const glow = ctx.createRadialGradient(0, 0, BIRD_R, 0, 0, BIRD_R + 12);
  glow.addColorStop(0, 'rgba(192,132,252,0.28)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, BIRD_R + 12, 0, Math.PI * 2); ctx.fill();

  // body
  const body = ctx.createRadialGradient(-3, -4, 2, 0, 0, BIRD_R);
  body.addColorStop(0,    '#e879f9');
  body.addColorStop(0.55, '#a855f7');
  body.addColorStop(1,    '#6d28d9');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2); ctx.fill();

  // wing
  ctx.fillStyle = 'rgba(216,180,254,0.55)';
  ctx.beginPath(); ctx.ellipse(-2, 5, 8, 4, -0.25, 0, Math.PI * 2); ctx.fill();

  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(5, -4, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath(); ctx.arc(6.5, -4, 2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // Score
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  ctx.shadowColor = 'rgba(168,85,247,0.7)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(String(g.score), W / 2, 52);
  ctx.shadowBlur = 0;
}

// ── Component ─────────────────────────────────────────────────
export default function FlappyBird() {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const gameRef    = useRef(null);   // live mutable game state
  const activeRef  = useRef(false);  // is loop running?
  const headerRef  = useRef(null);

  const [phase,      setPhase]      = useState('idle'); // idle | playing | dead
  const [finalScore, setFinalScore] = useState(0);
  const [lb,         setLb]         = useState([]);
  const [name,       setName]       = useState('');

  // Load leaderboard on mount
  useEffect(() => { setLb(getLB()); }, []);

  // Fade-in for section header
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw a single static frame (used for idle screen)
  const drawStatic = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawScene(ctx, { bird: { y: H / 2, vy: 0 }, pipes: [], score: 0 });
  }, []);

  // Draw idle canvas on mount + when returning to idle
  useEffect(() => {
    if (phase === 'idle') drawStatic();
  }, [phase, drawStatic]);

  // Game loop — starts when phase becomes 'playing'
  useEffect(() => {
    if (phase !== 'playing') return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    gameRef.current = { bird: { y: H / 2, vy: 0 }, pipes: [], score: 0, frame: 0 };
    activeRef.current = true;

    function tick() {
      if (!activeRef.current) return;
      const g = gameRef.current;

      // Physics
      g.frame++;
      g.bird.vy += GRAVITY;
      g.bird.y  += g.bird.vy;

      // Spawn pipe
      if (g.frame % PIPE_EVERY === 0) {
        g.pipes.push({
          x:     W,
          topH:  70 + Math.random() * (H - PIPE_GAP - 140),
          passed: false,
        });
      }

      // Move pipes + score
      for (const p of g.pipes) {
        p.x -= PIPE_SPEED;
        if (!p.passed && p.x + PIPE_W < BIRD_X) {
          p.passed = true;
          g.score++;
        }
      }
      g.pipes = g.pipes.filter(p => p.x + PIPE_W > 0);

      // Collision
      const { y } = g.bird;
      const hit =
        y - BIRD_R <= 0 ||
        y + BIRD_R >= H ||
        g.pipes.some(p =>
          BIRD_X + BIRD_R > p.x + 5 &&
          BIRD_X - BIRD_R < p.x + PIPE_W - 5 &&
          (y - BIRD_R < p.topH || y + BIRD_R > p.topH + PIPE_GAP)
        );

      if (hit) {
        activeRef.current = false;
        setFinalScore(g.score);
        setPhase('dead');
        return;
      }

      drawScene(ctx, g);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Flap action
  const flap = useCallback(() => {
    if (phase === 'idle') { setPhase('playing'); return; }
    if (phase === 'playing' && gameRef.current) {
      gameRef.current.bird.vy = FLAP_VEL;
    }
  }, [phase]);

  // Keyboard listener
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  // Save score and return to idle
  const handleSave = () => {
    setLb(pushLB(name, finalScore));
    setPhase('idle');
    setName('');
  };

  return (
    <section className={styles.section} id="game">
      <div ref={headerRef} className={`${styles.header} fade-in`}>
        <span className="section-tag">Mini Game</span>
        <h2 className="section-title">Flappy Bird</h2>
        <p className="section-subtitle">How far can you go? Top 10 scores are saved to the leaderboard.</p>
      </div>

      <div className={styles.layout}>

        {/* ── Canvas ── */}
        <div className={styles.gameWrap}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className={styles.canvas}
            onClick={flap}
          />

          {phase === 'idle' && (
            <div className={styles.overlay}>
              <div className={styles.card}>
                <div className={styles.birdIcon}>◉</div>
                <h3 className={styles.cardTitle}>Ready to Fly?</h3>
                <p className={styles.cardHint}>
                  Click or press <kbd>Space</kbd> to flap
                </p>
                <button className="btn btn-primary" onClick={() => setPhase('playing')}>
                  Start Game
                </button>
              </div>
            </div>
          )}

          {phase === 'dead' && (
            <div className={styles.overlay}>
              <div className={styles.card}>
                <p className={styles.gameOverLabel}>Game Over</p>
                <div className={styles.bigScore}>{finalScore}</div>
                <p className={styles.scoreUnit}>pipes cleared</p>
                <input
                  className={styles.nameInput}
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  maxLength={20}
                  autoFocus
                />
                <div className={styles.cardActions}>
                  <button className="btn btn-primary" onClick={handleSave}>Save Score</button>
                  <button className="btn btn-ghost"   onClick={() => setPhase('playing')}>Try Again</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Leaderboard ── */}
        <div className={styles.lb}>
          <h3 className={styles.lbTitle}>Top 10</h3>
          {lb.length === 0 ? (
            <p className={styles.lbEmpty}>No scores yet — be the first!</p>
          ) : (
            <ol className={styles.lbList}>
              {lb.map((entry, i) => (
                <li
                  key={`${entry.name}-${entry.score}-${i}`}
                  className={[
                    styles.lbRow,
                    i === 0 ? styles.gold   : '',
                    i === 1 ? styles.silver : '',
                    i === 2 ? styles.bronze : '',
                  ].join(' ')}
                >
                  <span className={styles.lbRank}>#{i + 1}</span>
                  <span className={styles.lbName}>{entry.name}</span>
                  <span className={styles.lbScore}>{entry.score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLevel } from '../context/LevelContext';
import styles from './QuestBoard.module.css';

// ─────────────────────────────────────────────────────────────
// CHALLENGE I — Spacebar Sprint
// ─────────────────────────────────────────────────────────────
function SpacebarChallenge({ onComplete }) {
  const [count, setCount] = useState(0);
  const TARGET    = 25;
  const calledRef = useRef(false);
  const boxRef    = useRef(null);

  // Focus the container so keydown fires here, not on window
  useEffect(() => { boxRef.current?.focus(); }, []);

  const handleKey = (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    setCount(c => {
      const next = Math.min(c + 1, TARGET);
      if (next >= TARGET && !calledRef.current) {
        calledRef.current = true;
        setTimeout(onComplete, 500);
      }
      return next;
    });
  };

  const pct = (count / TARGET) * 100;

  return (
    <div
      ref={boxRef}
      className={styles.challenge}
      tabIndex={0}
      onKeyDown={handleKey}
      aria-label="Spacebar challenge"
    >
      <p className={styles.hint}>Press <kbd>Space</kbd> on your keyboard</p>
      <div className={styles.bigCounter}>
        <span className={styles.bigNum}>{count}</span>
        <span className={styles.bigDen}>/ {TARGET}</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE II — The Scribe (typing)
// ─────────────────────────────────────────────────────────────
const PHRASES = [
  'the purple void calls to the brave',
  'rise through the system warrior',
  'only the worthy may advance',
  'code flows like water in the dark',
];

function TypingChallenge({ onComplete }) {
  const [phrase]  = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  const [input,  setInput]  = useState('');
  const calledRef = useRef(false);

  const handleChange = (e) => {
    const val = e.target.value.slice(0, phrase.length);
    setInput(val);
    if (val === phrase && !calledRef.current) {
      calledRef.current = true;
      setTimeout(onComplete, 400);
    }
  };

  return (
    <div className={styles.challenge}>
      <p className={styles.hint}>Type the phrase exactly as shown:</p>
      <div className={styles.phrase} aria-hidden="true">
        {phrase.split('').map((ch, i) => {
          const typed = input[i];
          const cls =
            typed === undefined ? styles.charPending :
            typed === ch        ? styles.charOk      :
                                  styles.charBad;
          return <span key={i} className={cls}>{ch}</span>;
        })}
      </div>
      <input
        className={styles.typingInput}
        value={input}
        onChange={handleChange}
        placeholder="Start typing…"
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE III — Reaction Master
// ─────────────────────────────────────────────────────────────
function ReactionChallenge({ onComplete }) {
  const ROUNDS   = 3;
  const LIMIT_MS = 700;

  // phase: idle | wait | go | hit | miss | done
  const [phase,     setPhase]    = useState('idle');
  const [round,     setRound]    = useState(0);
  const [lastMs,    setLastMs]   = useState(null);
  const startRef  = useRef(0);
  const timerRef  = useRef(null);
  const calledRef = useRef(false);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const startRound = useCallback(() => {
    setPhase('wait');
    setLastMs(null);
    timerRef.current = setTimeout(() => {
      setPhase('go');
      startRef.current = Date.now();
    }, 1200 + Math.random() * 2200);
  }, []);

  const handleClick = () => {
    if (phase === 'idle') { startRound(); return; }
    if (phase === 'wait') {
      clearTimeout(timerRef.current);
      setPhase('miss'); // too early
      return;
    }
    if (phase === 'go') {
      const rt = Date.now() - startRef.current;
      setLastMs(rt);
      if (rt > LIMIT_MS) { setPhase('miss'); return; }
      const next = round + 1;
      setRound(next);
      if (next >= ROUNDS) {
        setPhase('done');
        if (!calledRef.current) {
          calledRef.current = true;
          setTimeout(onComplete, 800);
        }
      } else {
        setPhase('hit');
      }
    }
    if (phase === 'hit')  { startRound(); }
    if (phase === 'miss') { setRound(0); startRound(); }
  };

  const circleClass = [
    styles.reactionCircle,
    phase === 'go'   ? styles.circleGo   : '',
    phase === 'done' ? styles.circleDone : '',
    phase === 'miss' ? styles.circleMiss : '',
  ].join(' ');

  const label =
    phase === 'idle' ? 'Click to begin'                                     :
    phase === 'wait' ? 'Wait for it…'                                       :
    phase === 'go'   ? 'NOW!'                                               :
    phase === 'hit'  ? `${lastMs}ms ✓  —  click to continue`               :
    phase === 'miss' ? (lastMs ? `${lastMs}ms — too slow! Retry` : 'Too early! Retry') :
    phase === 'done' ? 'Complete!'                                          : '';

  return (
    <div className={styles.challenge}>
      <p className={styles.hint}>
        Click the circle the instant it turns purple. Round {round}/{ROUNDS}.
      </p>
      <div className={circleClass} onClick={handleClick} role="button" tabIndex={0}
        onKeyDown={e => e.code === 'Space' && handleClick()}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE IV — Memory Keeper (color sequence)
// ─────────────────────────────────────────────────────────────
const TILES = [
  { id: 0, color: '#a855f7', label: '◆' },
  { id: 1, color: '#7c3aed', label: '■' },
  { id: 2, color: '#c026d3', label: '●' },
  { id: 3, color: '#e879f9', label: '▲' },
];

function SequenceChallenge({ onComplete }) {
  const LEN = 4;
  const [seq] = useState(() =>
    Array.from({ length: LEN }, () => TILES[Math.floor(Math.random() * TILES.length)])
  );
  const [phase,    setPhase]    = useState('showing');
  const [flashId,  setFlashId]  = useState(-1);
  const [progress, setProgress] = useState(0);
  const [shake,    setShake]    = useState(false);
  const calledRef = useRef(false);

  // Animate the sequence using a recursive setTimeout chain
  useEffect(() => {
    if (phase !== 'showing') return;
    setFlashId(-1);
    setProgress(0);
    let cancelled = false;
    let step = 0;

    function showNext() {
      if (cancelled) return;
      if (step >= seq.length) {
        setTimeout(() => { if (!cancelled) setPhase('input'); }, 400);
        return;
      }
      setFlashId(seq[step].id);
      step++;
      setTimeout(() => {
        if (!cancelled) setFlashId(-1);
        setTimeout(showNext, 300);
      }, 650);
    }

    const t = setTimeout(showNext, 700);
    return () => { cancelled = true; clearTimeout(t); };
  }, [phase, seq]);

  const handleTile = (id) => {
    if (phase !== 'input') return;
    if (id === seq[progress].id) {
      const next = progress + 1;
      setProgress(next);
      if (next >= seq.length && !calledRef.current) {
        calledRef.current = true;
        setTimeout(onComplete, 500);
      }
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setPhase('showing'); }, 600);
    }
  };

  return (
    <div className={styles.challenge}>
      <p className={styles.hint}>
        {phase === 'showing'
          ? 'Watch the sequence carefully…'
          : `Repeat the sequence — ${progress} / ${seq.length} correct`}
      </p>
      <div className={`${styles.tileGrid} ${shake ? styles.shake : ''}`}>
        {TILES.map(tile => {
          const isFlashing = flashId === tile.id;
          return (
            <button
              key={tile.id}
              className={styles.tile}
              style={{
                background:  tile.color,
                opacity:     phase === 'showing' ? (isFlashing ? 1 : 0.18) : 0.65,
                transform:   isFlashing ? 'scale(1.18)' : 'scale(1)',
                boxShadow:   isFlashing ? `0 0 28px ${tile.color}` : 'none',
                transition:  'opacity 0.12s, transform 0.12s, box-shadow 0.12s',
              }}
              onClick={() => handleTile(tile.id)}
              disabled={phase === 'showing'}
            >
              {tile.label}
            </button>
          );
        })}
      </div>
      {phase === 'input' && (
        <p className={styles.sub}>Click the tiles in order</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE V — Ancient Code (Konami)
// ─────────────────────────────────────────────────────────────
const KONAMI_CODES = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
const KONAMI_DISP  = ['↑','↑','↓','↓','←','→','←','→'];

function KonamiChallenge({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const calledRef = useRef(false);
  const boxRef    = useRef(null);

  useEffect(() => { boxRef.current?.focus(); }, []);

  const handleKey = useCallback((e) => {
    if (!e.key.startsWith('Arrow')) return;
    e.preventDefault();
    setProgress(prev => {
      if (e.key === KONAMI_CODES[prev]) {
        const next = prev + 1;
        if (next >= KONAMI_CODES.length && !calledRef.current) {
          calledRef.current = true;
          setTimeout(onComplete, 500);
        }
        return next;
      }
      return 0; // wrong key — reset
    });
  }, [onComplete]);

  return (
    <div
      ref={boxRef}
      className={styles.challenge}
      tabIndex={0}
      onKeyDown={handleKey}
      aria-label="Konami code challenge"
    >
      <p className={styles.hint}>
        Press the arrow keys in this exact order:
      </p>
      <div className={styles.konamiRow}>
        {KONAMI_DISP.map((k, i) => (
          <span
            key={i}
            className={[
              styles.konamiKey,
              i < progress          ? styles.konamiDone    : '',
              i === progress        ? styles.konamiCurrent : '',
            ].join(' ')}
          >
            {k}
          </span>
        ))}
      </div>
      {progress > 0 && progress < KONAMI_CODES.length && (
        <p className={styles.sub}>{progress} / {KONAMI_CODES.length} entered</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUEST BOARD — main section
// ─────────────────────────────────────────────────────────────
const QUESTS = [
  { id: 'spacebar', num: 'I',   title: 'Space Sprint',    desc: 'Slam the spacebar 25 times without mercy.'          },
  { id: 'typing',   num: 'II',  title: 'The Scribe',      desc: 'Transcribe a sacred phrase without a single error.' },
  { id: 'reaction', num: 'III', title: 'Purple Pulse',    desc: 'Click the target the instant it ignites purple.'    },
  { id: 'sequence', num: 'IV',  title: 'Memory Keeper',   desc: 'Memorize and repeat the four-tile color sequence.'  },
  { id: 'konami',   num: 'V',   title: 'Ancient Code',    desc: 'Input the legendary eight-key arrow sequence.'      },
];

export default function QuestBoard() {
  const { completed, level, mounted, completeQuest, setActiveChallenge } = useLevel();
  const [active,    setActive]    = useState(null);
  const [flashId,   setFlashId]   = useState(null);
  const headerRef = useRef(null);

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

  const openQuest = (id) => {
    const next = active === id ? null : id;
    setActive(next);
    setActiveChallenge(next); // tell FlappyBird to yield keys
  };

  const handleComplete = (id) => {
    completeQuest(id);
    setFlashId(id);
    setActive(null);
    setActiveChallenge(null);
    setTimeout(() => setFlashId(null), 1400);
  };

  const xpPct = (level / 5) * 100;

  if (!mounted) return null;

  return (
    <section className={styles.section} id="challenges">
      <div ref={headerRef} className={`${styles.header} fade-in`}>
        <span className="section-tag">The System</span>
        <h2 className="section-title">Level Up</h2>
        <p className="section-subtitle">
          Complete all five challenges to prove your worth and unlock a hidden realm.
        </p>
      </div>

      {/* XP meter */}
      <div className={styles.meter}>
        <div className={styles.meterTop}>
          <span className={styles.lvNum}>LV.{level}</span>
          <span className={styles.lvCap}>{level} / 5 complete</span>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
          {level === 5 && <div className={styles.xpShine} />}
        </div>
      </div>

      {/* Quest list */}
      <div className={styles.quests}>
        {QUESTS.map(q => {
          const done     = completed.includes(q.id);
          const isActive = active === q.id;
          const isFlash  = flashId === q.id;

          return (
            <div
              key={q.id}
              className={[
                styles.card,
                done     ? styles.cardDone   : '',
                isActive ? styles.cardActive : '',
                isFlash  ? styles.cardFlash  : '',
              ].join(' ')}
            >
              <button
                className={styles.cardRow}
                onClick={() => !done && openQuest(q.id)}
                disabled={done}
                aria-expanded={isActive}
              >
                <span className={styles.qNum}>{q.num}</span>
                <span className={styles.qInfo}>
                  <span className={styles.qTitle}>{q.title}</span>
                  <span className={styles.qDesc}>{q.desc}</span>
                </span>
                <span className={styles.qStatus}>
                  {done
                    ? <span className={styles.tagDone}>CLEARED</span>
                    : <span className={styles.tagOpen}>{isActive ? '▲' : '▼ START'}</span>
                  }
                </span>
              </button>

              {isActive && !done && (
                <div className={styles.body}>
                  {q.id === 'spacebar' && <SpacebarChallenge onComplete={() => handleComplete('spacebar')} />}
                  {q.id === 'typing'   && <TypingChallenge   onComplete={() => handleComplete('typing')}   />}
                  {q.id === 'reaction' && <ReactionChallenge onComplete={() => handleComplete('reaction')} />}
                  {q.id === 'sequence' && <SequenceChallenge onComplete={() => handleComplete('sequence')} />}
                  {q.id === 'konami'   && <KonamiChallenge   onComplete={() => handleComplete('konami')}   />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level 5 unlock banner */}
      {level === 5 && (
        <div className={styles.unlocked}>
          <div className={styles.unlockedCard}>
            <div className={styles.hexIcon}>⬡</div>
            <h3>The System Recognizes You</h3>
            <p>All challenges cleared. A sealed realm now awaits your entry.</p>
            <a href="/secret" className="btn btn-primary btn-large">
              Enter the Void →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

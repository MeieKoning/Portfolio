'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STORAGE_KEY = 'mk_quest_completed';

export default function SecretPage() {
  const [level,   setLevel]   = useState(null); // null = loading
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setLevel(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setLevel(0);
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (level < 5) {
    return (
      <div className={styles.locked}>
        <div className={styles.lockedCard}>
          <div className={styles.lockIcon}>⬡</div>
          <h1 className={styles.lockedTitle}>Access Denied</h1>
          <p className={styles.lockedDesc}>
            This realm is sealed. Complete all 5 system challenges to enter.
          </p>
          <div className={styles.lockedProgress}>
            <span className={styles.lockedLv}>{level} / 5</span>
            <span className={styles.lockedSub}>challenges complete</span>
          </div>
          <Link href="/#challenges" className="btn btn-ghost">
            ← Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>← Portfolio</Link>
        <span className={styles.navBadge}>LV. 5 — SYSTEM ACCESS</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />

        <div className={styles.heroContent}>
          <div className={styles.badge}>⬡ SYSTEM UNLOCKED</div>
          <h1 className={styles.title}>
            You Have Entered{' '}
            <span className="gradient-text">the Void</span>
          </h1>
          <p className={styles.sub}>
            Few reach this place. You proved your worth by completing every challenge
            the System set before you. This realm belongs to you now.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>5</span>
              <span className={styles.statLabel}>Quests Cleared</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>LV.5</span>
              <span className={styles.statLabel}>Max Rank</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLabel}>Completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty content area — to be filled */}
      <div className={styles.content}>
        <p className={styles.placeholder}>More content coming soon…</p>
      </div>
    </div>
  );
}

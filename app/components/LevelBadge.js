'use client';

import Link from 'next/link';
import { useLevel } from '../context/LevelContext';
import styles from './LevelBadge.module.css';

export default function LevelBadge() {
  const { level, mounted } = useLevel();
  if (!mounted) return null;

  const pct = (level / 5) * 100;

  return (
    <div className={`${styles.badge} ${level === 5 ? styles.max : ''}`}>
      <div className={styles.top}>
        <span className={styles.label}>LV.</span>
        <span className={styles.num}>{level}</span>
        <span className={styles.max5}>/5</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {level === 5 && (
        <Link href="/secret" className={styles.enterBtn}>
          Ascend →
        </Link>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import styles from './AgeCounter.module.css';

const BIRTH_DATE = new Date('2001-10-15T00:00:00');

function getAge() {
  const diff = Date.now() - BIRTH_DATE.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours   = Math.floor(totalMinutes / 60);
  const totalDays    = Math.floor(totalHours   / 24);
  return {
    days:    totalDays.toLocaleString(),
    hours:   String(totalHours   % 24).padStart(2, '0'),
    minutes: String(totalMinutes % 60).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  };
}

export default function AgeCounter() {
  const [age, setAge] = useState({ days: '—', hours: '—', minutes: '—', seconds: '—' });

  useEffect(() => {
    setAge(getAge());
    const id = setInterval(() => setAge(getAge()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { id: 'days',    label: 'days',    value: age.days    },
    { id: 'hours',   label: 'hours',   value: age.hours   },
    { id: 'minutes', label: 'minutes', value: age.minutes },
    { id: 'seconds', label: 'seconds', value: age.seconds },
  ];

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>I have been alive for</p>
      <div className={styles.grid}>
        {units.map((u, i) => (
          <>
            <div key={u.id} className={`${styles.card} ${u.id === 'seconds' ? styles.cardSeconds : ''}`}>
              <span className={styles.value}>{u.value}</span>
              <span className={styles.unit}>{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span key={`divider-${i}`} className={styles.divider} aria-hidden="true">:</span>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

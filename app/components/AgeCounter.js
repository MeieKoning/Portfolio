'use client';

import { Fragment, useEffect, useState } from 'react';
import styles from './AgeCounter.module.css';

const BIRTH_DATE = new Date('2001-10-15T00:00:00');

function getAge() {
  const diff = Date.now() - BIRTH_DATE.getTime();
  const totalMinutes = Math.floor(diff / 60000);
  const totalDays    = Math.floor(totalMinutes / 1440);
  return {
    days:    totalDays.toLocaleString(),
    minutes: String(totalMinutes % 60).padStart(2, '0'),
  };
}

export default function AgeCounter() {
  const [age, setAge] = useState({ days: '—', minutes: '—' });

  useEffect(() => {
    setAge(getAge());
    const id = setInterval(() => setAge(getAge()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { id: 'days',    label: 'days',    value: age.days    },
    { id: 'minutes', label: 'minutes', value: age.minutes },
  ];

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>I have been alive for</p>
      <div className={styles.grid}>
        {units.map((u, i) => (
          <Fragment key={u.id}>
            <div className={styles.card}>
              <span className={styles.value}>{u.value}</span>
              <span className={styles.unit}>{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className={styles.divider} aria-hidden="true">:</span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

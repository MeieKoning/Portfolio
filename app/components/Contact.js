'use client';

import { useEffect, useRef } from 'react';
import styles from './Contact.module.css';

export default function Contact() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="contact">
      <div className={styles.glow} aria-hidden="true" />
      <div ref={ref} className={`${styles.inner} fade-in`}>
        <span className="section-tag">Contact</span>
        <h2 className="section-title">Let&apos;s Connect</h2>
        <p className={styles.subtitle}>
          Have a project in mind, or just want to say hi?
          I&apos;m always open to interesting conversations.
        </p>
        <a href="mailto:hello@example.com" className="btn btn-primary btn-large">
          Say Hello
        </a>
      </div>
    </section>
  );
}

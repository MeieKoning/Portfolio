'use client';

import { useEffect, useState } from 'react';
import styles from './Nav.module.css';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.logo}>MK</div>
      <ul className={styles.links}>
        <li><a href="#about"    onClick={e => handleScroll(e, 'about')}>About</a></li>
        <li><a href="#projects" onClick={e => handleScroll(e, 'projects')}>Projects</a></li>
        <li><a href="#game"     onClick={e => handleScroll(e, 'game')}>Game</a></li>
        <li><a href="#contact"  onClick={e => handleScroll(e, 'contact')}>Contact</a></li>
      </ul>
    </nav>
  );
}

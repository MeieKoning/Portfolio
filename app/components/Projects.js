'use client';

import { useEffect, useRef } from 'react';
import styles from './Projects.module.css';

const PROJECTS = [
  {
    tag: 'AI · Featured',
    title: 'This Portfolio',
    desc: 'A fully custom portfolio website designed and built with AI assistance — showcasing real-time data, clean design, and modern web techniques.',
    tech: ['Next.js', 'React', 'CSS Modules'],
    link: 'https://github.com/MeieKoning/Portfolio',
    linkLabel: 'View Source →',
    featured: true,
  },
  {
    tag: 'Coming Soon',
    title: 'Next Project',
    desc: 'Something new is in the works. Stay tuned.',
    tech: ['TBD'],
    comingSoon: true,
  },
  {
    tag: 'Coming Soon',
    title: 'Next Project',
    desc: 'Something new is in the works. Stay tuned.',
    tech: ['TBD'],
    comingSoon: true,
  },
];

function ProjectCard({ project }) {
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
    <article
      ref={ref}
      className={[
        styles.card,
        'fade-in',
        project.featured  ? styles.featured  : '',
        project.comingSoon ? styles.comingSoon : '',
      ].join(' ')}
    >
      <div className={styles.glow} aria-hidden="true" />
      <span className={styles.tag}>{project.tag}</span>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardDesc}>{project.desc}</p>
      <div className={styles.tech}>
        {project.tech.map(t => <span key={t}>{t}</span>)}
      </div>
      {project.link && (
        <div className={styles.links}>
          <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {project.linkLabel}
          </a>
        </div>
      )}
    </article>
  );
}

export default function Projects() {
  const headerRef = useRef(null);

  useEffect(() => {
    const el = headerRef.current;
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
    <section className={styles.section} id="projects">
      <div ref={headerRef} className={`${styles.header} fade-in`}>
        <span className="section-tag">Work</span>
        <h2 className="section-title">Things I&apos;ve Built</h2>
        <p className="section-subtitle">A collection of projects created with AI, code, and curiosity.</p>
      </div>
      <div className={styles.grid}>
        {PROJECTS.map((p, i) => <ProjectCard key={i} project={p} />)}
      </div>
    </section>
  );
}

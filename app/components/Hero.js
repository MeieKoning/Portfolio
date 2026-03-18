import AgeCounter from './AgeCounter';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="about">
      {/* Background effects */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          Available for opportunities
        </div>

        <h1 className={styles.title}>
          Hi, I&apos;m{' '}
          <span className="gradient-text">Meie Koning</span>
        </h1>

        <p className={styles.subtitle}>
          Builder, creator, and explorer at the intersection of AI and design.
          I craft digital experiences that are both functional and beautiful.
        </p>

        <AgeCounter />

        <div className={styles.actions}>
          <a href="#projects" className="btn btn-primary">View My Work</a>
          <a href="#contact"  className="btn btn-ghost">Get in Touch</a>
        </div>
      </div>
    </section>
  );
}

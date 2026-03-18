import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Meie Koning. Built with curiosity.</p>
    </footer>
  );
}

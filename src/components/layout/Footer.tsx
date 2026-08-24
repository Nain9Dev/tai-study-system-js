import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.container}`}>
        <p>© {new Date().getFullYear()} NainDev. Analytics privacy-first integradas.</p>
        <div className={styles.links}>
          <a href="https://github.com/Nain9Dev" className={styles.link} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#" className={styles.link}>Volver arriba</a>
        </div>
      </div>
    </footer>
  );
}

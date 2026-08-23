import { Link } from '@tanstack/react-router';
import { Database, ServerCrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import styles from './Header.module.css';

export function Header() {
  const [mode, setMode] = useState<'loading' | 'local' | 'static'>('loading');

  useEffect(() => {
    const interval = setInterval(() => {
      setMode(apiClient.getMode());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.layout}`}>
        <Link to="/" className={styles.brand}>
          <span>NainDev</span> TAI
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.link} activeProps={{ className: styles.linkActive }} activeOptions={{ exact: true }}>
            Simulacro
          </Link>
          <Link to="/analytics" className={styles.link} activeProps={{ className: styles.linkActive }}>
            Estadísticas
          </Link>
          <a href="https://naindev.com" className={styles.link} target="_blank" rel="noopener noreferrer">
            Portfolio
          </a>
          <Link to="/perfil" className={styles.link} activeProps={{ className: styles.linkActive }}>
            Mi Perfil
          </Link>
        </nav>

        <div className={`${styles.connectionBadge} ${mode === 'local' ? styles.connectionLocal : mode === 'static' ? styles.connectionStatic : ''}`}>
          {mode === 'local' ? <Database size={16} /> : <ServerCrash size={16} />}
          {mode === 'loading' ? 'Conectando...' : mode === 'local' ? 'API Conectada' : 'Modo Offline'}
        </div>
      </div>
    </header>
  );
}

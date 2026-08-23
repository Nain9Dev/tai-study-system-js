import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import styles from './Auth.module.css';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const continueAsGuest = useAuthStore(s => s.continueAsGuest);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate({ to: '/perfil' });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate({ to: '/' });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <Card title="Iniciar Sesión">
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
                placeholder="tu@email.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
              {isLoading ? 'Conectando...' : 'Entrar'}
            </Button>
          </form>

          <div className={styles.authLinks}>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            <br /><br />
            O si prefieres, puedes <button type="button" onClick={handleGuest} className={styles.guestButton}>continuar como invitado</button> (los datos solo se guardarán en este navegador).
          </div>
        </Card>
      </div>
    </div>
  );
}

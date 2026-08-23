import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import styles from './Auth.module.css';

export const Route = createFileRoute('/register')({
  component: Register,
});

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await register(nombre, email, password);
      navigate({ to: '/perfil' });
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <Card title="Crear Cuenta">
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre</label>
              <input 
                type="text" 
                required 
                value={nombre} 
                onChange={e => setNombre(e.target.value)}
                className={styles.input}
                placeholder="Tu nombre completo"
              />
            </div>
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
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirmar Contraseña</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>

          <div className={styles.authLinks}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

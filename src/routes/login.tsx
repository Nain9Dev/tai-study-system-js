import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <Card title="Iniciar Sesión">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-line)', background: 'var(--color-bg-alt)', color: 'var(--color-text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-line)', background: 'var(--color-bg-alt)', color: 'var(--color-text)' }}
            />
          </div>

          <Button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Conectando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--color-primary)' }}>Regístrate aquí</Link>
          <br /><br />
          O si prefieres, puedes <button onClick={handleGuest} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>continuar como invitado</button> (los datos solo se guardarán en este navegador).
        </div>
      </Card>
    </div>
  );
}

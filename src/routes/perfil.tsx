import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';

export const Route = createFileRoute('/perfil')({
  beforeLoad: () => {
    // Si no está logueado y no es invitado, redirigir
    const { isGuest, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated() && !isGuest) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: Perfil,
});

function Perfil() {
  const user = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const logout = useAuthStore(s => s.logout);

  return (
    <div className="shell" style={{ marginTop: '2rem' }}>
      <Card title="Mi Perfil">
        {isGuest ? (
          <div>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              Estás usando el sistema en modo invitado. Tus estadísticas se guardan de forma local en tu navegador.
            </p>
            <p>Para sincronizar tus datos en la nube y no perder tu progreso, por favor regístrate.</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginBottom: '2rem' }}>
              <div><strong>Nombre:</strong> {user?.nombre}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Rol:</strong> {user?.rol}</div>
            </div>
            <button onClick={() => { logout(); window.location.href = '/login'; }} style={{ padding: '0.5rem 1rem', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

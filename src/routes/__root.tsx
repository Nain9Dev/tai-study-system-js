import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { BaseLayout } from '../components/layout/BaseLayout';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/tokens.css';
import '../styles/main.css';

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { isGuest, isAuthenticated } = useAuthStore.getState();
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
    
    if (!isAuthenticated() && !isGuest && !isAuthRoute) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  ),
})

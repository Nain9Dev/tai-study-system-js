import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { OfflineIndicator } from '../ui/OfflineIndicator';

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <>
      <Header />
      <main className="shell" style={{ minHeight: 'calc(100vh - 12rem)', paddingTop: '2rem', paddingBottom: '4rem' }}>
        {children}
      </main>
      <Footer />
      <OfflineIndicator />
    </>
  );
}

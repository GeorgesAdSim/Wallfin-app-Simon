import { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { BottomNav } from '../Navigation/BottomNav';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
}

export function AppLayout({ children, showBottomNav = true, showHeader = true }: AppLayoutProps) {
  const { isDemo } = useApp();

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {showHeader && <Header />}

      <main id="main-content" className="max-w-4xl mx-auto">
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}

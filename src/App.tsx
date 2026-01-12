import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Accueil } from './components/Home/Accueil';
import { Credits } from './components/Dashboard/Credits';
import { Demandes } from './components/Demandes/Demandes';
import { SimpleCreditDetail } from './components/Credits/SimpleCreditDetail';
import { AppLayout } from './components/Layout/AppLayout';
import { InstallBanner } from './components/PWA/InstallBanner';

function AppContent() {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return currentView === 'register' ? <Register /> : <Login />;
  }

  const showBottomNav = ['accueil', 'credits', 'demandes'].includes(currentView);
  const showHeader = currentView !== 'credit-detail';

  const renderView = () => {
    switch (currentView) {
      case 'accueil':
        return <Accueil />;
      case 'credits':
        return <Credits />;
      case 'demandes':
        return <Demandes />;
      case 'credit-detail':
        return <SimpleCreditDetail />;
      default:
        return <Credits />;
    }
  };

  return (
    <AppLayout showBottomNav={showBottomNav} showHeader={showHeader}>
      {renderView()}
    </AppLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <InstallBanner />
    </AppProvider>
  );
}

export default App;

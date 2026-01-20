import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Accueil } from './components/Home/Accueil';
import { Credits } from './components/Dashboard/Credits';
import { Messages } from './components/Messages/Messages';
import { MessageDetail } from './components/Messages/MessageDetail';
import { Demandes } from './components/Demandes/Demandes';
import { SimpleCreditDetail } from './components/Credits/SimpleCreditDetail';
import { GlobalReport } from './components/Reports/GlobalReport';
import { AppLayout } from './components/Layout/AppLayout';
import { InstallBanner } from './components/PWA/InstallBanner';
import { notificationService } from './services/NotificationService';

function AppContent() {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return currentView === 'register' ? <Register /> : <Login />;
  }

  const showBottomNav = ['accueil', 'credits', 'messages', 'demandes'].includes(currentView);
  const showHeader = !['credit-detail', 'message-detail', 'global-report'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'accueil':
        return <Accueil />;
      case 'credits':
        return <Credits />;
      case 'messages':
        return <Messages />;
      case 'message-detail':
        return <MessageDetail />;
      case 'demandes':
        return <Demandes />;
      case 'credit-detail':
        return <SimpleCreditDetail />;
      case 'global-report':
        return <GlobalReport />;
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
  useEffect(() => {
    const initializeApp = async () => {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#f97316' });
        } catch (error) {
          console.warn('StatusBar not available:', error);
        }

        try {
          await SplashScreen.hide();
        } catch (error) {
          console.warn('SplashScreen not available:', error);
        }

        try {
          await Keyboard.setAccessoryBarVisible({ isVisible: true });
        } catch (error) {
          console.warn('Keyboard not available:', error);
        }

        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapacitorApp.exitApp();
          } else {
            window.history.back();
          }
        });
      }

      try {
        await notificationService.initialize();
        console.log('Notification service initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeApp();

    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  return (
    <AppProvider>
      <AppContent />
      <InstallBanner />
    </AppProvider>
  );
}

export default App;

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ViewType, Client, Credit } from '../types';
import { mockClient, mockCredits } from '../data/mockData';

interface AppContextType {
  currentView: ViewType;
  selectedCreditId: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  client: Client | null;
  credits: Credit[];
  navigateTo: (view: ViewType, creditId?: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  getCreditById: (creditId: string) => Credit | undefined;
  updateClient: (updates: Partial<Client>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [credits] = useState<Credit[]>(mockCredits);

  const navigateTo = useCallback((view: ViewType, creditId: string | null = null) => {
    setCurrentView(view);
    setSelectedCreditId(creditId);
  }, []);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticated(value);
    if (value) {
      setClient(mockClient);
      setCurrentView('credits');
    } else {
      setClient(null);
      setCurrentView('login');
    }
  }, []);

  const getCreditById = useCallback((creditId: string) => {
    return credits.find((c) => c.id === creditId);
  }, [credits]);

  const updateClient = useCallback((updates: Partial<Client>) => {
    setClient((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates, updated_at: new Date().toISOString() };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedCreditId,
        isAuthenticated,
        isDemo,
        client,
        credits,
        navigateTo,
        setAuthenticated,
        getCreditById,
        updateClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

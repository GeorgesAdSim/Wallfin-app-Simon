import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ViewType, Client, Credit, Message } from '../types';
import { mockClient, mockCredits, mockMessages } from '../data/mockData';

const MESSAGES_STORAGE_KEY = 'wallfin_messages_read';

interface AppContextType {
  currentView: ViewType;
  selectedCreditId: string | null;
  selectedMessageId: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  client: Client | null;
  credits: Credit[];
  messages: Message[];
  unreadMessagesCount: number;
  navigateTo: (view: ViewType, id?: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  getCreditById: (creditId: string) => Credit | undefined;
  getMessageById: (messageId: string) => Message | undefined;
  markMessageAsRead: (messageId: string) => void;
  updateClient: (updates: Partial<Client>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadReadMessagesFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReadMessagesToStorage(readIds: string[]) {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(readIds));
  } catch {
    // Storage might be unavailable
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [credits] = useState<Credit[]>(mockCredits);
  const [messages, setMessages] = useState<Message[]>(() => {
    const readIds = loadReadMessagesFromStorage();
    return mockMessages.map((msg) => ({
      ...msg,
      lu: msg.lu || readIds.includes(msg.id),
    }));
  });

  const unreadMessagesCount = messages.filter((m) => !m.lu).length;

  const navigateTo = useCallback((view: ViewType, id: string | null = null) => {
    setCurrentView(view);
    if (view === 'credit-detail') {
      setSelectedCreditId(id);
      setSelectedMessageId(null);
    } else if (view === 'message-detail') {
      setSelectedMessageId(id);
      setSelectedCreditId(null);
    } else {
      setSelectedCreditId(null);
      setSelectedMessageId(null);
    }
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

  const getMessageById = useCallback((messageId: string) => {
    return messages.find((m) => m.id === messageId);
  }, [messages]);

  const markMessageAsRead = useCallback((messageId: string) => {
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === messageId ? { ...msg, lu: true } : msg
      );
      const readIds = updated.filter((m) => m.lu).map((m) => m.id);
      saveReadMessagesToStorage(readIds);
      return updated;
    });
  }, []);

  const updateClient = useCallback((updates: Partial<Client>) => {
    setClient((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates, updated_at: new Date().toISOString() };
    });
  }, []);

  useEffect(() => {
    const readIds = loadReadMessagesFromStorage();
    if (readIds.length > 0) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          lu: msg.lu || readIds.includes(msg.id),
        }))
      );
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedCreditId,
        selectedMessageId,
        isAuthenticated,
        isDemo,
        client,
        credits,
        messages,
        unreadMessagesCount,
        navigateTo,
        setAuthenticated,
        getCreditById,
        getMessageById,
        markMessageAsRead,
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

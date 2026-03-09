import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ViewType, Client, Credit, Message } from '../types';
import { mockCredits, mockMessages, mockClient } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentView: ViewType;
  selectedCreditId: string | null;
  selectedMessageId: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isLoading: boolean;
  client: Client | null;
  credits: Credit[];
  messages: Message[];
  unreadMessagesCount: number;
  userRole: string | null;
  navigateTo: (view: ViewType, id?: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  getCreditById: (creditId: string) => Credit | undefined;
  getMessageById: (messageId: string) => Message | undefined;
  markMessageAsRead: (messageId: string) => void;
  updateClient: (updates: Partial<Client>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [credits] = useState<Credit[]>(mockCredits);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [userRole, setUserRole] = useState<string | null>(null);

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('inbox_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return;
      }

      if (data && data.length > 0) {
        const convertedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          titre: msg.titre,
          contenu: msg.contenu,
          created_at: msg.created_at,
          is_read: msg.is_read,
          type: 'info'
        }));
        setMessages(convertedMessages);
      } else {
        setMessages(mockMessages);
      }
    } catch {
      // keep existing messages on error
    }
  }, []);

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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        return null;
      }

      setUserRole(profile.role);

      const clientData: Client = {
        id: profile.id,
        email: profile.email,
        first_name: profile.name.split(' ')[0] || profile.name,
        last_name: profile.name.split(' ').slice(1).join(' ') || '',
        phone: profile.phone || '',
        address: '',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      return clientData;
    } catch {
      return null;
    }
  }, []);

  const handleSignIn = useCallback(async (userId: string) => {
    const profile = await fetchUserProfile(userId);
    if (profile) {
      setClient(profile);
      setIsDemo(false);
    } else {
      setClient(mockClient);
      setIsDemo(true);
    }
    setIsAuthenticatedState(true);
    setCurrentView('credits');
    fetchMessages(userId);
  }, [fetchUserProfile, fetchMessages]);

  const handleSignOut = useCallback(() => {
    setIsAuthenticatedState(false);
    setIsDemo(true);
    setClient(null);
    setMessages(mockMessages);
    setUserRole(null);
    setCurrentView('login');
  }, []);

  const setAuthenticated = useCallback(async (value: boolean) => {
    if (value) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await handleSignIn(user.id);
      }
    } else {
      handleSignOut();
    }
  }, [handleSignIn, handleSignOut]);

  const getCreditById = useCallback((creditId: string) => {
    return credits.find((c) => c.id === creditId);
  }, [credits]);

  const getMessageById = useCallback((messageId: string) => {
    return messages.find((m) => m.id === messageId);
  }, [messages]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );

    try {
      await supabase
        .from('inbox_messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch {
      // silent fail for read status
    }
  }, []);

  const updateClient = useCallback((updates: Partial<Client>) => {
    setClient((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates, updated_at: new Date().toISOString() };
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        (async () => {
          await handleSignIn(session.user.id);
          setIsLoading(false);
        })();
      } else if (event === 'SIGNED_OUT') {
        handleSignOut();
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSignIn, handleSignOut]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedCreditId,
        selectedMessageId,
        isAuthenticated,
        isDemo,
        isLoading,
        client,
        credits,
        messages,
        unreadMessagesCount,
        userRole,
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

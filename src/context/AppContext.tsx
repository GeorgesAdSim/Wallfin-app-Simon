import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { ViewType, Client, Message } from '../types';
import type { Credit } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentView: ViewType;
  selectedCreditId: string | null;
  selectedMessageId: string | null;
  isAuthenticated: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('inbox_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setMessages([]);
        return;
      }

      const convertedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        titre: msg.titre,
        contenu: msg.contenu,
        created_at: msg.created_at,
        is_read: msg.is_read,
        type: 'info'
      }));
      setMessages(convertedMessages);
    } catch {
      setMessages([]);
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

  const handleSignIn = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profile) {
        setUserRole(profile.role);
        setClient({
          id: profile.id,
          email: profile.email,
          first_name: profile.name?.split(' ')[0] || profile.name || '',
          last_name: profile.name?.split(' ').slice(1).join(' ') || '',
          phone: profile.phone || '',
          address: '',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });
      } else {
        setClient(null);
        setUserRole(null);
      }
    } catch {
      setClient(null);
      setUserRole(null);
    }

    setIsAuthenticatedState(true);
    setCurrentView('credits');
    fetchMessages(userId);
  }, [fetchMessages]);

  const handleSignOut = useCallback(() => {
    setIsAuthenticatedState(false);
    setClient(null);
    setCredits([]);
    setMessages([]);
    setUserRole(null);
    setCurrentView('login');
  }, []);

  const handleSignInRef = useRef(handleSignIn);
  handleSignInRef.current = handleSignIn;
  const handleSignOutRef = useRef(handleSignOut);
  handleSignOutRef.current = handleSignOut;

  const setAuthenticated = useCallback(async (value: boolean) => {
    if (value) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await handleSignInRef.current(user.id);
      }
    } else {
      handleSignOutRef.current();
    }
  }, []);

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
      // silent
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
        const userId = session.user.id;
        (async () => {
          await handleSignInRef.current(userId);
          setIsLoading(false);
        })();
      } else if (event === 'SIGNED_OUT') {
        handleSignOutRef.current();
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedCreditId,
        selectedMessageId,
        isAuthenticated,
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

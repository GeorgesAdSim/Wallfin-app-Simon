import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ViewType, Client, Credit, Message } from '../types';
import type { Profile } from '../types/database';
import { mockCredits } from '../data/mockData';
import { supabase } from '../lib/supabase';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [credits] = useState<Credit[]>(mockCredits);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  const fetchMessages = useCallback(async () => {
    console.log('🔍 [DEBUG] Fetching messages from Supabase...');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log('👤 [DEBUG] Current user:', {
        id: user?.id,
        email: user?.email,
        error: userError
      });

      if (userError) {
        console.error('❌ [DEBUG] Error getting user:', userError);
        return;
      }

      if (!user) {
        console.warn('⚠️ [DEBUG] No user authenticated');
        return;
      }

      setIsLoadingMessages(true);

      console.log('📡 [DEBUG] Executing query: SELECT * FROM inbox_messages WHERE user_id =', user.id);

      const { data, error } = await supabase
        .from('inbox_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📨 [DEBUG] Supabase response:', {
        data: data,
        dataLength: data?.length,
        error: error,
        errorDetails: error ? JSON.stringify(error) : null
      });

      if (error) {
        console.error('❌ [DEBUG] Error fetching messages:', error);
        return;
      }

      if (data) {
        console.log('✅ [DEBUG] Messages fetched successfully:', data.length, 'messages');
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
        console.warn('⚠️ [DEBUG] No data returned from query');
        setMessages([]);
      }
    } catch (err) {
      console.error('❌ [DEBUG] Exception during fetch:', err);
    } finally {
      setIsLoadingMessages(false);
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

  const fetchUserProfile = useCallback(async () => {
    console.log('👤 [DEBUG] Fetching user profile from database...');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ [DEBUG] Error getting user:', userError);
        return null;
      }

      console.log('📡 [DEBUG] Fetching profile for user ID:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('👤 [DEBUG] Profile response:', {
        profile,
        error: profileError
      });

      if (profileError) {
        console.error('❌ [DEBUG] Error fetching profile:', profileError);
        return null;
      }

      if (profile) {
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

        console.log('✅ [DEBUG] Profile converted to client:', clientData);
        return clientData;
      }

      return null;
    } catch (err) {
      console.error('❌ [DEBUG] Exception fetching profile:', err);
      return null;
    }
  }, []);

  const setAuthenticated = useCallback(async (value: boolean) => {
    setIsAuthenticated(value);
    if (value) {
      const profile = await fetchUserProfile();
      if (profile) {
        setClient(profile);
      }
      setCurrentView('credits');
      fetchMessages();
    } else {
      setClient(null);
      setCurrentView('login');
      setMessages([]);
    }
  }, [fetchMessages, fetchUserProfile]);

  const getCreditById = useCallback((creditId: string) => {
    return credits.find((c) => c.id === creditId);
  }, [credits]);

  const getMessageById = useCallback((messageId: string) => {
    return messages.find((m) => m.id === messageId);
  }, [messages]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    console.log('📖 [DEBUG] Marking message as read:', messageId);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );

    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('❌ [DEBUG] Error marking message as read:', error);
      } else {
        console.log('✅ [DEBUG] Message marked as read successfully');
      }
    } catch (err) {
      console.error('❌ [DEBUG] Exception marking message as read:', err);
    }
  }, []);

  const updateClient = useCallback((updates: Partial<Client>) => {
    setClient((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates, updated_at: new Date().toISOString() };
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 [DEBUG] User authenticated, fetching messages...');
      fetchMessages();
    }
  }, [isAuthenticated, fetchMessages]);

  useEffect(() => {
    console.log('🚀 [DEBUG] App starting, checking for existing session...');

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      console.log('🔐 [DEBUG] Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: error
      });

      if (session?.user) {
        console.log('✅ [DEBUG] Found existing session, auto-authenticating...');
        setAuthenticated(true);
      } else {
        console.log('ℹ️ [DEBUG] No existing session found');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 [DEBUG] Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
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

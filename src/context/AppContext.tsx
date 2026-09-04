import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ViewType, Client, Credit, Message } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentView: ViewType;
  selectedCreditId: string | null;
  selectedMessageId: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  mfaChallengeRequired: boolean;
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
  refreshData: () => void;
  completeMfaChallenge: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mfaChallengeRequired, setMfaChallengeRequired] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

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
    if (!value) {
      setClient(null);
      setCredits([]);
      setMessages([]);
      setCurrentView('login');
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
      prev.map((msg) => msg.id === messageId ? { ...msg, lu: true } : msg)
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    await supabase.from('wallfin_messages_lu').upsert({
      message_id: messageId,
      client_email: user.email.toLowerCase(),
    }, { onConflict: 'message_id,client_email' });
  }, []);

  const updateClient = useCallback((updates: Partial<Client>) => {
    setClient((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates, updated_at: new Date().toISOString() };
    });
  }, []);

  const loadCredits = useCallback(async (email: string) => {
    const { data } = await supabase
      .from('wallfin_credits')
      .select('*')
      .ilike('client_email', email)
      .order('created_at', { ascending: false });

    if (data) {
      setCredits(data.map((c) => ({
        id: c.id,
        client_id: c.client_email,
        reference_number: c.reference_number,
        type: c.type,
        montant_initial: c.montant_initial,
        mensualite: c.mensualite,
        taeg: c.taeg,
        duree_total: c.duree_total,
        echeances_restantes: c.echeances_restantes,
        deja_rembourse: c.deja_rembourse,
        restant_du: c.restant_du,
        date_debut: c.date_debut,
        date_fin: c.date_fin,
        prochaine_echeance: c.prochaine_echeance,
        jour_prelevement: c.jour_prelevement,
        statut: c.statut,
        created_at: c.created_at,
        updated_at: c.updated_at,
      })));
    }
  }, []);

  const loadMessages = useCallback(async (email: string) => {
    const emailLower = email.toLowerCase();

    const { data: msgs } = await supabase
      .from('wallfin_messages')
      .select('*')
      .or(`client_email.is.null,client_email.ilike.${emailLower}`)
      .order('created_at', { ascending: false });

    if (!msgs) return;

    const { data: readRows } = await supabase
      .from('wallfin_messages_lu')
      .select('message_id')
      .ilike('client_email', emailLower);

    const readSet = new Set((readRows ?? []).map((r) => r.message_id));

    setMessages(msgs.map((m) => ({
      id: m.id,
      titre: m.titre,
      contenu: m.contenu,
      date: m.created_at,
      lu: readSet.has(m.id),
      type: m.type,
    })));
  }, []);

  const loadClientProfile = useCallback(async (email: string, userId: string) => {
    const { data: dossier } = await supabase
      .from('v_dossiers_clip_clients')
      .select('client_prenom, client_nom, client_gsm')
      .ilike('client_email', email)
      .not('client_email', 'is', null)
      .limit(1)
      .maybeSingle();

    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata ?? {};

    const clientData: Client = {
      id: userId,
      email,
      first_name: dossier?.client_prenom || meta.first_name || email.split('@')[0],
      last_name: dossier?.client_nom || meta.last_name || '',
      phone: meta.phone || dossier?.client_gsm || '',
      address: meta.address || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setClient(clientData);
    setIsAuthenticated(true);
    setCurrentView('credits');

    await Promise.all([loadCredits(email), loadMessages(email)]);
  }, [loadCredits, loadMessages]);

  const refreshData = useCallback(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        loadCredits(user.email);
        loadMessages(user.email);
      }
    });
  }, [loadCredits, loadMessages]);

  const checkAalAndLoad = useCallback(async (email: string, userId: string) => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (data && data.nextLevel === 'aal2' && data.currentLevel !== data.nextLevel) {
      setMfaChallengeRequired(true);
      return;
    }

    setMfaChallengeRequired(false);
    await loadClientProfile(email, userId);
  }, [loadClientProfile]);

  const completeMfaChallenge = useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAalAndLoad(session.user.email!, session.user.id);
      }
    });
  }, [checkAalAndLoad]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAalAndLoad(session.user.email!, session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAalAndLoad(session.user.email!, session.user.id);
      } else {
        setIsAuthenticated(false);
        setMfaChallengeRequired(false);
        setClient(null);
        setCredits([]);
        setMessages([]);
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAalAndLoad]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedCreditId,
        selectedMessageId,
        isAuthenticated,
        isDemo: false,
        mfaChallengeRequired,
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
        refreshData,
        completeMfaChallenge,
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

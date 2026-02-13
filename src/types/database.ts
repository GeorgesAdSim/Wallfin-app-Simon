export type Gender = 'M' | 'F' | 'Autre';
export type CreditType = 'personnel' | 'auto' | 'immobilier' | 'travaux' | 'consommation' | 'regroupement';
export type CreditStatus = 'active' | 'completed' | 'suspended';
export type MensualiteStatus = 'paid' | 'pending' | 'overdue';
export type RequestType = 'information' | 'settlement' | 'new_credit';
export type RequestStatus = 'pending' | 'in_progress' | 'completed';
export type MessageType = 'paiement' | 'info' | 'rappel';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  address: string | null;
  birth_date: string | null;
  gender: Gender | null;
  is_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  client_id: string;
  reference: string;
  type: CreditType;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  total_months: number;
  remaining_months: number;
  interest_rate: number;
  start_date: string;
  status: CreditStatus;
  created_at: string;
}

export interface Mensualite {
  id: string;
  credit_id: string;
  month_number: number;
  due_date: string;
  amount: number;
  principal: number;
  interest: number;
  status: MensualiteStatus;
  paid_at: string | null;
}

export interface Request {
  id: string;
  client_id: string | null;
  type: RequestType;
  subject: string;
  message: string;
  credit_id: string | null;
  status: RequestStatus;
  response: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface InboxMessage {
  id: string;
  user_id: string;
  titre: string;
  contenu: string;
  date: string;
  lu: boolean;
  type: MessageType;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: Omit<Client, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      credits: {
        Row: Credit;
        Insert: Omit<Credit, 'id' | 'created_at'>;
        Update: Partial<Omit<Credit, 'id' | 'client_id' | 'created_at'>>;
      };
      mensualites: {
        Row: Mensualite;
        Insert: Omit<Mensualite, 'id'>;
        Update: Partial<Omit<Mensualite, 'id' | 'credit_id'>>;
      };
      requests: {
        Row: Request;
        Insert: Omit<Request, 'id' | 'created_at' | 'updated_at' | 'status' | 'response'>;
        Update: Partial<Omit<Request, 'id' | 'created_at'>>;
      };
      inbox_messages: {
        Row: InboxMessage;
        Insert: Omit<InboxMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<InboxMessage, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}

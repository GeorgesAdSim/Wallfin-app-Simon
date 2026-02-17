import { useState, useEffect } from 'react';
import { Send, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Viewer {
  id: string;
  name: string;
  email: string;
}

export function AdminMessages() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [selectedViewer, setSelectedViewer] = useState('');
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchViewers();
  }, []);

  const fetchViewers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'viewer')
        .order('name');

      if (error) {
        console.error('Error fetching viewers:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des utilisateurs' });
      } else if (data) {
        setViewers(data);
      }
    } catch (err) {
      console.error('Exception fetching viewers:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des utilisateurs' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedViewer || !titre.trim() || !contenu.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('inbox_messages')
        .insert({
          user_id: selectedViewer,
          titre: titre.trim(),
          contenu: contenu.trim(),
          is_read: false
        });

      if (error) {
        console.error('Error sending message:', error);
        setMessage({ type: 'error', text: 'Erreur lors de l\'envoi du message' });
      } else {
        setMessage({ type: 'success', text: 'Message envoyé avec succès' });
        setSelectedViewer('');
        setTitre('');
        setContenu('');

        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Exception sending message:', err);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi du message' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Administration</h3>
          <p className="text-sm text-gray-500">Envoyer un message aux clients</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinataire
          </label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Chargement des utilisateurs...
            </div>
          ) : (
            <select
              value={selectedViewer}
              onChange={(e) => setSelectedViewer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white"
            >
              <option value="">Sélectionnez un destinataire</option>
              {viewers.map((viewer) => (
                <option key={viewer.id} value={viewer.id}>
                  {viewer.name} ({viewer.email})
                </option>
              ))}
            </select>
          )}
          {!isLoading && viewers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Aucun utilisateur disponible</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du message
          </label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex: Mise à jour de votre dossier"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du message
          </label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Rédigez votre message..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleSendMessage}
          disabled={isSending || !selectedViewer || !titre.trim() || !contenu.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Envoyer</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500">
          <strong>Note :</strong> Le message sera envoyé uniquement si vous avez les droits administrateur.
          Les règles de sécurité RLS vérifient automatiquement vos permissions.
        </p>
      </div>
    </div>
  );
}

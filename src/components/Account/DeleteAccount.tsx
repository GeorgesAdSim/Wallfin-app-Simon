import { useState } from 'react';
import { Trash2, Mail, Clock, ShieldAlert, ChevronRight, CheckCircle } from 'lucide-react';

export function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('Veuillez confirmer que vous comprenez les conséquences de cette action.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const subject = encodeURIComponent('Demande de suppression de compte');
      const body = encodeURIComponent(
        `Bonjour,\n\nJe souhaite demander la suppression de mon compte et de toutes mes données personnelles.\n\nEmail du compte : ${email}\n${reason ? `Raison : ${reason}\n` : ''}\nCordialement`
      );
      window.location.href = `mailto:contact@wallfin.be?subject=${subject}&body=${body}`;

      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Demande prise en compte</h2>
          <p className="text-gray-500 mb-4">
            Votre client de messagerie a été ouvert avec un email pré-rempli
            à destination de <strong className="text-gray-700">contact@wallfin.be</strong>.
          </p>
          <p className="text-gray-500 mb-8">
            Si l'email ne s'est pas ouvert automatiquement, vous pouvez envoyer
            votre demande directement à <strong className="text-gray-700">contact@wallfin.be</strong>.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700 text-left">
                Vos données seront supprimées dans un délai maximum de <strong>30 jours</strong> après
                réception de votre demande.
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToHome}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={handleBackToHome}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Wallfin</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Suppression de compte</h1>
          <p className="text-gray-500">
            Vous pouvez demander la suppression de votre compte et de l'ensemble
            de vos données personnelles.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Envoi par email</p>
              <p className="text-xs text-gray-500 mt-1">
                Votre demande sera envoyée à <strong>contact@wallfin.be</strong> pour traitement par notre équipe.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Délai de traitement</p>
              <p className="text-xs text-gray-500 mt-1">
                Vos données seront supprimées dans un délai maximum de <strong>30 jours</strong> après
                réception de votre demande.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Action irréversible</p>
              <p className="text-xs text-gray-500 mt-1">
                La suppression de votre compte est définitive. Toutes vos données,
                historiques de crédits et messages seront supprimés.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adresse email du compte
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.be"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Raison de la suppression <span className="text-gray-400 font-normal">(facultative)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-600">
              Je comprends que cette action est irréversible et que toutes mes données
              seront définitivement supprimées dans un délai de 30 jours.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Envoyer ma demande de suppression</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8">
          Pour toute question, contactez-nous directement :<br />
          <a href="mailto:contact@wallfin.be" className="text-orange-500 hover:text-orange-600 transition-colors">
            contact@wallfin.be
          </a>
          {' '} | +32 4 228 19 42
        </p>
      </main>
    </div>
  );
}

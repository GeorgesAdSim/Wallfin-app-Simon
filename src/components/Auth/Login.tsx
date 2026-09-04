import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError('Email ou mot de passe incorrect. Contactez-nous au +32 4 228 19 42 si le problème persiste.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Entrez votre email ci-dessus pour réinitialiser votre mot de passe.');
      return;
    }

    setResetLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'be.wallfin.espaceclient://reset-callback' }
    );

    setResetLoading(false);

    if (resetError) {
      setError("Erreur lors de l'envoi de l'email. Réessayez dans quelques instants.");
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <img
              src="/images_(3).png"
              alt="Wallfin"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900">Wallfin</div>
              <div className="text-sm text-slate-600">Espace Client</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {resetSent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                Vérifiez vos emails
              </h1>
              <p className="text-slate-600 mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setResetSent(false)}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                Connexion
              </h1>
              <p className="text-sm text-slate-500 text-center mb-6">
                Entrez vos identifiants pour accéder à votre espace
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="jean.dupont@email.be"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="w-full text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
                >
                  {resetLoading ? 'Envoi...' : 'Mot de passe oublié ?'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          © 2025 Wallfin - Courtier en crédit<br />
          +32 4 228 19 42 | wallfin.be
        </div>
      </div>
    </div>
  );
}

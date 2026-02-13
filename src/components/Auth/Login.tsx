import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export function Login() {
  const { navigateTo, setAuthenticated } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🔐 [DEBUG] Login attempt with email:', email);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 [DEBUG] Login response:', {
        user: data.user,
        session: data.session,
        error: authError
      });

      if (authError) {
        console.error('❌ [DEBUG] Login error:', authError);
        setError('Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('✅ [DEBUG] Login successful! User ID:', data.user.id);
        setAuthenticated(true);
      }
    } catch (err) {
      console.error('❌ [DEBUG] Login exception:', err);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Connexion
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                required
              />
            </div>

            <button
              type="button"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Mot de passe oublié ?
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigateTo('register')}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Pas encore de compte ?{' '}
              <span className="text-orange-500 font-medium">S'inscrire</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          © 2025 Wallfin - Courtier en crédit<br />
          +32 4 228 19 42 | wallfin.be
        </div>
      </div>
    </div>
  );
}

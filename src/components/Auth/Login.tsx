import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DEMO_EMAIL = 'googleplay.review@wallfin.be';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (trimmedEmail === DEMO_EMAIL) {
        if (!needsPassword) {
          setNeedsPassword(true);
          setIsLoading(false);
          return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (authError) {
          setError('Email ou mot de passe incorrect.');
          setIsLoading(false);
          return;
        }
      } else {
        setNeedsPassword(false);
        setPassword('');

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (otpError) {
          setError('Erreur lors de l\'envoi du lien de connexion. Veuillez réessayer.');
          setIsLoading(false);
          return;
        }

        setSuccess(true);
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <img
              src="/images_(3).png"
              alt="Wallfin"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="text-left">
              <div className="text-2xl font-bold text-[#333]">Wallfin</div>
              <div className="text-sm text-[#666]">Espace Client</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#333] mb-2 text-center">
            Connexion
          </h1>
          <p className="text-sm text-[#666] mb-6 text-center">
            Connectez-vous avec votre adresse email
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm text-center">
              <p className="font-medium mb-2">Lien de connexion envoyé</p>
              <p>Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      if (e.target.value.trim().toLowerCase() !== DEMO_EMAIL) {
                        setNeedsPassword(false);
                        setPassword('');
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                    placeholder="votre@email.be"
                    required
                  />
                </div>
              </div>

              {needsPassword && (
                <>
                  <p className="text-xs text-[#666] text-center">
                    Compte démo — entrez le mot de passe fourni
                  </p>
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                        placeholder="Mot de passe"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading || (needsPassword && !password)}
                className="w-full bg-[#F57C00] hover:bg-[#E67100] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-[#666]">
          © 2026 Wallfin - Courtier en crédit<br />
          +32 4 228 19 42 | wallfin.be
        </div>
      </div>
    </div>
  );
}

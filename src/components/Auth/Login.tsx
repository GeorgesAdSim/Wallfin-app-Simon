import { useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, is_active')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        setError('Une erreur est survenue. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      if (!profile) {
        setError('Accès non autorisé. Contactez votre conseiller Wallfin.');
        setIsLoading(false);
        return;
      }

      if (!profile.is_active) {
        setError('Votre compte est désactivé. Contactez votre conseiller Wallfin.');
        setIsLoading(false);
        return;
      }

      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (magicLinkError) {
        console.error('Error sending magic link:', magicLinkError);
        setError('Erreur lors de l\'envoi du lien de connexion. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Login exception:', err);
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
            <div className="w-12 h-12 bg-[#FF9500] rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">W</span>
            </div>
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent"
                    placeholder="jean.dupont@email.be"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF9500] hover:bg-[#e68600] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi en cours...' : 'Se connecter'}
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
